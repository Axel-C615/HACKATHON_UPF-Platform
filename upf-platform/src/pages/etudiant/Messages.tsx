import { useState, useEffect, useRef } from "react";
import Icon from "../../components/shared/Icon";
import { ABSENCES_ADMIN } from "../../data/mockData";
import type { Theme, UserType, TranslationStrings, AbsenceDataRow } from "../../types";
import { usePatchAuthUser, useSession } from "../../context/SessionContext";
import { authUserInitials, formatAuthDisplayName } from "../../services/authApi";
import {
  appendStudentRequest,
  loadStudentRequests,
  STUDENT_REQUESTS_CHANGED_EVENT,
  type StudentRequestRecord,
} from "../../services/studentRequestsApi";
import {
  fetchAdministrateurRaw,
  fetchAllConversationsRaw,
  fetchEnseignantRaw,
  fetchEtudiantRaw,
  fetchMessagesRaw,
  mapApiConversationToListItem,
  mapApiMessageToUi,
  pickStr,
  postCreateConversation,
  postMessage,
  putAdministrateur,
  putEnseignant,
  putEtudiant,
} from "../../services/schoolApi";

type ApiProfileRole = "etudiant" | "enseignant" | "administrateur";

function sessionProfileRole(session: { role?: string } | null): ApiProfileRole | null {
  const r = (session?.role ?? "").toLowerCase();
  if (r.includes("etudiant")) return "etudiant";
  if (r.includes("enseignant")) return "enseignant";
  if (r.includes("administr")) return "administrateur";
  return null;
}

function stripProfileNavProps(body: Record<string, unknown>, role: ApiProfileRole): void {
  delete body.conversations;
  delete body.Conversations;
  if (role === "etudiant") {
    delete body.niveauScolaire;
    delete body.NiveauScolaire;
  }
  if (role === "enseignant") {
    delete body.matiere_Enseigner;
    delete body.Matiere_Enseigner;
  }
}

const MAX_PROFILE_PHOTO_CHARS = 1_200_000;

async function shrinkImageFileToDataUrl(file: File, maxSide = 512, quality = 0.82): Promise<string> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * scale);
  const h = Math.round(bmp.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Impossible d’afficher l’image.");
  ctx.drawImage(bmp, 0, 0, w, h);
  bmp.close();
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Compression impossible"));
          return;
        }
        const fr = new FileReader();
        fr.onload = () => resolve(String(fr.result));
        fr.onerror = () => reject(new Error("Lecture impossible"));
        fr.readAsDataURL(blob);
      },
      "image/jpeg",
      quality
    );
  });
}

async function fileToProfileDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Veuillez choisir une image (JPG, PNG, etc.).");
  if (file.size > 8 * 1024 * 1024) throw new Error("Fichier trop volumineux (max. 8 Mo).");
  let dataUrl = await new Promise<string>((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(String(fr.result));
    fr.onerror = () => rej(new Error("Lecture du fichier impossible"));
    fr.readAsDataURL(file);
  });
  if (dataUrl.length > MAX_PROFILE_PHOTO_CHARS) {
    dataUrl = await shrinkImageFileToDataUrl(file);
  }
  if (dataUrl.length > MAX_PROFILE_PHOTO_CHARS * 1.2) {
    throw new Error("Image encore trop lourde ; essayez une photo plus petite.");
  }
  return dataUrl;
}

async function fetchProfileRawByRole(role: ApiProfileRole, id: number): Promise<Record<string, unknown>> {
  if (role === "etudiant") return fetchEtudiantRaw(id);
  if (role === "enseignant") return fetchEnseignantRaw(id);
  return fetchAdministrateurRaw(id);
}

async function putProfileByRole(role: ApiProfileRole, id: number, body: Record<string, unknown>): Promise<void> {
  if (role === "etudiant") return putEtudiant(id, body);
  if (role === "enseignant") return putEnseignant(id, body);
  return putAdministrateur(id, body);
}

interface ConversationMessage {
  id: number;
  from: string;
  avatar: string;
  content: string;
  time: string;
  date: string;
  type: "text" | "file" | "voice";
  fileName?: string;
  fileType?: string;
  fileUrl?: string;
  voiceUrl?: string;
}

interface Conversation {
  id: number;
  name: string;
  avatar: string;
  unread: boolean;
  messages: ConversationMessage[];
}

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 1,
    name: "Administration",
    avatar: "A",
    unread: true,
    messages: [
      { id: 1, from: "Administration", avatar: "A", content: "Votre dossier d'inscription a été validé.", time: "09:30", date: "Aujourd'hui", type: "text" },
    ],
  },
  {
    id: 2,
    name: "Prof. Benali",
    avatar: "B",
    unread: true,
    messages: [
      { id: 2, from: "Prof. Benali", avatar: "B", content: "Le cours de demain est reporté.", time: "11:00", date: "Aujourd'hui", type: "text" },
    ],
  },
  {
    id: 3,
    name: "Fatima Z.",
    avatar: "F",
    unread: false,
    messages: [
      { id: 3, from: "Fatima Z.", avatar: "F", content: "Tu as les notes du dernier TD?", time: "14:22", date: "Hier", type: "text" },
    ],
  },
];

// ─── MESSAGES ─────────────────────────────────────────────────────────────────
interface MessagesProps {
  theme: Theme;
  t: TranslationStrings;
  initialSelectedMessageId?: number | null;
}

export function Messages({ theme, t, initialSelectedMessageId }: MessagesProps) {
  const session = useSession();
  const fileRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const [search, setSearch] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [selectedConversationId, setSelectedConversationId] = useState(initialSelectedMessageId || INITIAL_CONVERSATIONS[0].id);
  const [reply, setReply] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [convSource, setConvSource] = useState<"mock" | "api">("mock");
  const [loadingConvos, setLoadingConvos] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    if (initialSelectedMessageId) {
      setSelectedConversationId(initialSelectedMessageId);
    }
  }, [initialSelectedMessageId]);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoadingConvos(true);
      try {
        const rows = await fetchAllConversationsRaw();
        if (cancel || !rows.length) return;
        const list: Conversation[] = rows.map((r) => {
          const { id, name, avatar } = mapApiConversationToListItem(r);
          return { id, name, avatar, unread: false, messages: [] };
        });
        setConversations(list);
        setConvSource("api");
        setSelectedConversationId((cur) => {
          if (initialSelectedMessageId) return initialSelectedMessageId;
          return list.some((c) => c.id === cur) ? cur : list[0].id;
        });
      } catch {
        /* mock */
      } finally {
        if (!cancel) setLoadingConvos(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [initialSelectedMessageId]);

  useEffect(() => {
    if (convSource !== "api" || !selectedConversationId) return;
    let cancel = false;
    (async () => {
      setLoadingMessages(true);
      try {
        const raw = await fetchMessagesRaw(selectedConversationId);
        if (cancel) return;
        const uid = session?.id ?? 0;
        const mapped = raw.map((m) => mapApiMessageToUi(m, uid));
        setConversations((prev) =>
          prev.map((c) => (c.id === selectedConversationId ? { ...c, messages: mapped, unread: false } : c))
        );
      } catch {
        /* garder messages existants */
      } finally {
        if (!cancel) setLoadingMessages(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [convSource, selectedConversationId, session?.id]);

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId) || conversations[0];

  const filtered = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const appendMessageToCurrent = (message: ConversationMessage) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === selectedConversationId
          ? { ...conv, unread: false, messages: [...conv.messages, message] }
          : conv
      )
    );
  };

  const send = async () => {
    if (!reply.trim()) return;
    const text = reply.trim();
    if (convSource === "api" && session) {
      try {
        await postMessage(text, session.id, selectedConversationId);
        const raw = await fetchMessagesRaw(selectedConversationId);
        const mapped = raw.map((m) => mapApiMessageToUi(m, session.id));
        setConversations((prev) =>
          prev.map((c) => (c.id === selectedConversationId ? { ...c, messages: mapped, unread: false } : c))
        );
        setReply("");
      } catch {
        /* échec silencieux — l’utilisateur peut réessayer */
      }
      return;
    }
    const newMessage: ConversationMessage = {
      id: selectedConversation.messages.length + 1,
      from: "Moi",
      avatar: "M",
      content: text,
      time: new Date().toLocaleTimeString("fr", { hour: "2-digit", minute: "2-digit" }),
      date: "Aujourd'hui",
      type: "text",
    };
    appendMessageToCurrent(newMessage);
    setReply("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileUrl = URL.createObjectURL(file);
    const payload: ConversationMessage = {
      id: selectedConversation.messages.length + 1,
      from: "Moi",
      avatar: "M",
      content: file.name,
      time: new Date().toLocaleTimeString("fr", { hour: "2-digit", minute: "2-digit" }),
      date: "Aujourd'hui",
      type: "file",
      fileName: file.name,
      fileType: file.type,
      fileUrl,
    };
    appendMessageToCurrent(payload);
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordedChunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
        const voiceUrl = URL.createObjectURL(blob);
        const audioMessage: ConversationMessage = {
          id: selectedConversation.messages.length + 1,
          from: "Moi",
          avatar: "M",
          content: `${t.voiceNote}`,
          time: new Date().toLocaleTimeString("fr", { hour: "2-digit", minute: "2-digit" }),
          date: "Aujourd'hui",
          type: "voice",
          voiceUrl,
        };
        appendMessageToCurrent(audioMessage);
        setIsRecording(false);
      };

      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Microphone access refused", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <div className="splitView">
      {/* List */}
      <div className="splitView__left" style={{ backgroundColor: theme.surface, borderRadius: 14, border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: 14 }}>
          <h3 style={{ margin: "0 0 12px", fontWeight: 800, color: theme.text, fontSize: 15 }}>{t.myMessages}</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", backgroundColor: theme.bg, borderRadius: 10, border: `1px solid ${theme.border}` }}>
            <Icon name="search" size={14} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.search} style={{ background: "none", border: "none", outline: "none", fontSize: 13, color: theme.text, flex: 1 }} />
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "0 8px 8px" }}>
          {loadingConvos && <div style={{ padding: 12, fontSize: 12, color: theme.textMuted }}>Chargement…</div>}
          {filtered.map((conv) => {
            const lastMessage = conv.messages[conv.messages.length - 1];
            return (
              <button
                key={conv.id}
                onClick={() => setSelectedConversationId(conv.id)}
                style={{
                  width: "100%",
                  padding: "12px 10px",
                  borderRadius: 10,
                  border: "none",
                  background: selectedConversationId === conv.id ? "#dbeafe" : "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  marginBottom: 4,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{conv.avatar}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontWeight: 800, fontSize: 13, color: selectedConversationId === conv.id ? "#1d4ed8" : theme.text }}>{conv.name}</span>
                      <span style={{ fontSize: 11, color: theme.textMuted }}>{lastMessage?.time || ""}</span>
                    </div>
                    <div style={{ fontSize: 12, color: theme.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lastMessage?.content || ""}</div>
                  </div>
                  {conv.unread && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3b82f6", flexShrink: 0 }} />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail */}
      <div className="splitView__right" style={{ backgroundColor: theme.surface, borderRadius: 14, border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {selectedConversation ? (
          <>
            <div style={{ padding: "14px 20px", borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800 }}>{selectedConversation.avatar}</div>
              <div>
                <div style={{ fontWeight: 800, color: theme.text }}>{selectedConversation.name}</div>
                <div style={{ fontSize: 12, color: theme.textMuted }}>Conversation</div>
              </div>
            </div>
            <div style={{ flex: 1, padding: 24, overflowY: "auto" }}>
              {loadingMessages && <div style={{ fontSize: 12, color: theme.textMuted, marginBottom: 12 }}>Chargement des messages…</div>}
              {selectedConversation.messages.map((msg, i) => (
                <div key={i} style={{ display: "flex", justifyContent: msg.from === "Moi" ? "flex-end" : "flex-start", marginBottom: 8 }}>
                  <div style={{ maxWidth: "70%", backgroundColor: msg.from === "Moi" ? "#1d4ed8" : theme.bg, borderRadius: "14px", padding: "10px 14px", color: msg.from === "Moi" ? "#fff" : theme.text }}>
                    {msg.type === "file" && (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                        <span>{t.fileUploaded}: {msg.fileName}</span>
                        <a href={msg.fileUrl} download={msg.fileName} style={{ color: msg.from === "Moi" ? "#fff" : "#1d4ed8", textDecoration: "underline" }}>{t.download}</a>
                      </div>
                    )}
                    {msg.type === "voice" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <span>{t.voiceNote}</span>
                        <audio controls src={msg.voiceUrl} style={{ width: "100%" }} />
                      </div>
                    )}
                    {msg.type === "text" && <div>{msg.content}</div>}
                    <div style={{ fontSize: 10, color: msg.from === "Moi" ? "rgba(255,255,255,0.7)" : theme.textMuted, textAlign: "right", marginTop: 4 }}>{msg.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: 16, borderTop: `1px solid ${theme.border}`, display: "flex", gap: 10, alignItems: "center" }}>
              <input ref={fileRef} type="file" style={{ display: "none" }} onChange={handleFileUpload} />
              <button onClick={() => fileRef.current?.click()} style={{ padding: "9px", borderRadius: 10, border: `1px solid ${theme.border}`, background: theme.bg, color: theme.textMuted, cursor: "pointer" }}>
                📎
              </button>
              <button
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onMouseLeave={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                style={{ padding: "9px", borderRadius: 10, border: `1px solid ${isRecording ? "#ef4444" : theme.border}`, background: isRecording ? "#fee2e2" : theme.bg, color: isRecording ? "#ef4444" : theme.textMuted, cursor: "pointer" }}
              >
                🎤
              </button>
              <input value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => e.key === "Enter" && void send()} placeholder={t.reply} style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: `1px solid ${theme.border}`, backgroundColor: theme.bg, color: theme.text, fontSize: 14, outline: "none" }} />
              <button type="button" onClick={() => void send()} style={{ padding: "10px 16px", borderRadius: 10, background: "#1d4ed8", border: "none", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>{t.send}</button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: theme.textMuted }}>{t.selectMessage}</div>
        )}
      </div>
    </div>
  );
}

// ─── MES ABSENCES ─────────────────────────────────────────────────────────────
interface MesAbsencesProps {
  theme: Theme;
  t: TranslationStrings;
}

export function MesAbsences({ theme, t }: MesAbsencesProps) {
  const session = useSession();
  const absKey = session ? `ET${session.id}` : "ET001";
  const studentAbsences = ABSENCES_ADMIN[absKey] || ABSENCES_ADMIN["ET001"] || [];
  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 900, color: theme.text, marginBottom: 4 }}>{t.attendanceTitle}</h2>
      <p style={{ color: theme.textMuted, fontSize: 13, marginBottom: 20 }}>{t.attendanceSubtitle}</p>

      <div style={{ backgroundColor: theme.surface, borderRadius: 16, border: `1px solid ${theme.border}`, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#1e3a8a" }}>
              <th style={{ padding: "14px 20px", textAlign: "left", color: "#93c5fd", fontSize: 12, fontWeight: 700 }}>{t.subject}</th>
              {studentAbsences[0]?.seances.map((s) => (
                <th key={s.date} style={{ padding: "14px 16px", textAlign: "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>{s.date}</th>
              ))}
              <th style={{ padding: "14px 16px", textAlign: "center", color: "#93c5fd", fontSize: 12, fontWeight: 700 }}>{t.totalAbs}</th>
            </tr>
          </thead>
          <tbody>
            {studentAbsences.map((row, i) => {
              const absCount = row.seances.filter((s) => !s.present).length;
              return (
                <tr key={i} style={{ borderBottom: `1px solid ${theme.border}`, backgroundColor: i % 2 === 0 ? theme.surface : theme.bg }}>
                  <td style={{ padding: "13px 20px", fontWeight: 700, fontSize: 13, color: theme.text }}>{row.matiere}</td>
                  {row.seances.map((s, j) => (
                    <td key={j} style={{ padding: "13px 16px", textAlign: "center" }}>
                      <span style={{ display: "inline-block", width: 28, height: 28, borderRadius: "50%", backgroundColor: s.present ? "#dcfce7" : "#fee2e2", color: s.present ? "#16a34a" : "#dc2626", fontSize: 14, lineHeight: "28px", fontWeight: 800 }}>
                        {s.present ? "✓" : "✗"}
                      </span>
                    </td>
                  ))}
                  <td style={{ padding: "13px 16px", textAlign: "center" }}>
                    <span style={{ backgroundColor: absCount >= 3 ? "#fee2e2" : absCount >= 1 ? "#fef3c7" : "#dcfce7", color: absCount >= 3 ? "#dc2626" : absCount >= 1 ? "#d97706" : "#16a34a", borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 800 }}>
                      {absCount} {t.abs}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", gap: 16, marginTop: 14, fontSize: 12, color: theme.textMuted, alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 16, height: 16, borderRadius: "50%", backgroundColor: "#dcfce7" }} /> {t.present}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 16, height: 16, borderRadius: "50%", backgroundColor: "#fee2e2" }} /> {t.absent}</div>
      </div>
    </div>
  );
}

// ─── SCOLARITÉ ────────────────────────────────────────────────────────────────
interface ScolariteProps {
  theme: Theme;
  t: TranslationStrings;
  userType: UserType;
  tuitionStatus: string;
  onTuitionStatusChange?: (status: string) => void;
}

export function Scolarite({ theme, t, userType, tuitionStatus, onTuitionStatusChange }: ScolariteProps) {
  const total = 28000, paye = 18000, reste = total - paye;
  const pct   = Math.round((paye / total) * 100);

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 900, color: theme.text, marginBottom: 4 }}>{t.tuition}</h2>
      <p style={{ color: theme.textMuted, fontSize: 13, marginBottom: 24 }}>{t.paymentTracking}</p>

      {userType === "administration" && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 700 }}>{t.setTuitionStatus}</label>
          <select value={tuitionStatus} onChange={(e) => onTuitionStatusChange?.(e.target.value)} style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.surface, color: theme.text }}>
            <option value="payant">{t.paidStatus}</option>
            <option value="boursier">{t.scholarStatus}</option>
          </select>
        </div>
      )}

      {tuitionStatus === "payant" ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 24 }}>
            {[
              { label: t.totalAmount, value: `${total.toLocaleString()} MAD`, icon: "wallet", color: "#1d4ed8", bg: "#dbeafe" },
              { label: t.paid,        value: `${paye.toLocaleString()} MAD`,  icon: "check",  color: "#059669", bg: "#d1fae5" },
              { label: t.remaining,   value: `${reste.toLocaleString()} MAD`, icon: "alert",  color: "#ea580c", bg: "#fed7aa" },
            ].map((s, i) => (
              <div key={i} style={{ backgroundColor: theme.surface, borderRadius: 16, padding: 22, border: `1px solid ${theme.border}` }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: s.bg, display: "flex", alignItems: "center", justifyContent: "center", color: s.color, marginBottom: 14 }}>
                  <Icon name={s.icon} size={20} />
                </div>
                <div style={{ fontSize: 11, color: theme.textMuted, marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: theme.text }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div style={{ backgroundColor: theme.surface, borderRadius: 16, padding: 24, border: `1px solid ${theme.border}`, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontWeight: 800, color: theme.text }}>{t.paymentProgress}</span>
              <span style={{ fontWeight: 800, color: "#059669" }}>{pct}%</span>
            </div>
            <div style={{ height: 12, backgroundColor: theme.bg, borderRadius: 6, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#059669,#10b981)", borderRadius: 6 }} />
            </div>
          </div>
        </>
      ) : (
        <div style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 24 }}>🏅</span>
          <div>
            <div style={{ fontWeight: 800, color: "#92400e" }}>{t.scholarStatus}</div>
            <div style={{ fontSize: 13, color: "#a16207" }}>{t.scholarDesc}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ESPACE ÉTUDIANT-ADMIN / REQUÊTES (ADMIN) ────────────────────────────────
interface EspaceAdminProps {
  theme: Theme;
  t: TranslationStrings;
  userType: UserType;
}

export function EspaceAdmin({ theme, t, userType }: EspaceAdminProps) {
  const session = useSession();
  const isAdministration = userType === "administration";

  const [subject, setSubject] = useState("");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  const [requests, setRequests] = useState<StudentRequestRecord[]>(() => loadStudentRequests());

  useEffect(() => {
    if (!isAdministration) return;
    const sync = () => setRequests(loadStudentRequests());
    sync();
    window.addEventListener(STUDENT_REQUESTS_CHANGED_EVENT, sync);
    return () => window.removeEventListener(STUDENT_REQUESTS_CHANGED_EVENT, sync);
  }, [isAdministration]);

  const topics = ["Attestation de scolarité", "Certificat de présence", "Relevé de notes", "Demande de bourse", "Autre demande"];

  if (isAdministration) {
    return (
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: theme.text, marginBottom: 4 }}>{t.adminRequestsTitle}</h2>
        <p style={{ color: theme.textMuted, fontSize: 13, marginBottom: 8 }}>{t.adminRequestsSubtitle}</p>
        <p style={{ color: theme.textMuted, fontSize: 11, marginBottom: 20, fontStyle: "italic", lineHeight: 1.5 }}>{t.adminRequestsLocalHint}</p>

        {requests.length === 0 ? (
          <div
            style={{
              backgroundColor: theme.surface,
              borderRadius: 16,
              padding: 28,
              border: `1px solid ${theme.border}`,
              color: theme.textMuted,
              fontSize: 14,
              textAlign: "center",
            }}
          >
            {t.adminRequestsEmpty}
          </div>
        ) : (
          <div style={{ backgroundColor: theme.surface, borderRadius: 16, border: `1px solid ${theme.border}`, overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
              <thead>
                <tr style={{ backgroundColor: "#1e3a8a" }}>
                  <th style={{ padding: "12px 14px", textAlign: "left", color: "#93c5fd", fontSize: 11, fontWeight: 700 }}>{t.adminRequestsColDate}</th>
                  <th style={{ padding: "12px 14px", textAlign: "left", color: "#fff", fontSize: 11, fontWeight: 700 }}>{t.adminRequestsColStudent}</th>
                  <th style={{ padding: "12px 14px", textAlign: "left", color: "#fff", fontSize: 11, fontWeight: 700 }}>{t.adminRequestsColEmail}</th>
                  <th style={{ padding: "12px 14px", textAlign: "left", color: "#fff", fontSize: 11, fontWeight: 700 }}>{t.adminRequestsColSubject}</th>
                  <th style={{ padding: "12px 14px", textAlign: "left", color: "#fff", fontSize: 11, fontWeight: 700 }}>{t.adminRequestsColMessage}</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r, i) => (
                  <tr key={r.id} style={{ borderBottom: `1px solid ${theme.border}`, backgroundColor: i % 2 === 0 ? theme.surface : theme.bg }}>
                    <td style={{ padding: "12px 14px", fontSize: 12, color: theme.textMuted, whiteSpace: "nowrap" }}>
                      {new Date(r.submittedAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700, color: theme.text }}>{r.studentDisplayName}</td>
                    <td style={{ padding: "12px 14px", fontSize: 12, color: theme.textMuted }}>{r.studentEmail}</td>
                    <td style={{ padding: "12px 14px", fontSize: 13, color: theme.text }}>{r.subject}</td>
                    <td style={{ padding: "12px 14px", fontSize: 12, color: theme.text, lineHeight: 1.45, maxWidth: 320 }}>{r.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  if (sent) {
    return (
      <div style={{ backgroundColor: "#d1fae5", border: "1px solid #6ee7b7", borderRadius: 16, padding: 32, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
        <div style={{ fontWeight: 800, color: "#065f46", fontSize: 18 }}>{t.requestSent}</div>
        <div style={{ color: "#047857", fontSize: 13, marginTop: 6 }}>{t.requestResponse}</div>
        <button
          type="button"
          onClick={() => {
            setSent(false);
            setSubject("");
            setMsg("");
          }}
          style={{ marginTop: 16, padding: "10px 24px", borderRadius: 10, background: "#059669", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer" }}
        >
          {t.newRequest}
        </button>
      </div>
    );
  }

  const canSend = subject.trim() !== "" && msg.trim() !== "" && session != null;

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 900, color: theme.text, marginBottom: 4 }}>{t.studentAdminSpace}</h2>
      <p style={{ color: theme.textMuted, fontSize: 13, marginBottom: 24 }}>{t.sendRequestDescription}</p>
      {!session && (
        <div
          style={{
            backgroundColor: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: 12,
            padding: "12px 16px",
            marginBottom: 16,
            color: "#92400e",
            fontSize: 13,
          }}
        >
          Connectez-vous avec un compte étudiant pour envoyer une demande à l’administration.
        </div>
      )}
      <div style={{ backgroundColor: theme.surface, borderRadius: 16, padding: 28, border: `1px solid ${theme.border}`, maxWidth: 600 }}>
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: theme.textMuted, marginBottom: 8 }}>{t.requestSubject}</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={!session}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 10,
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.bg,
              color: theme.text,
              fontSize: 14,
              outline: "none",
              opacity: session ? 1 : 0.65,
            }}
          >
            <option value="">{t.selectSubject}</option>
            {topics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: theme.textMuted, marginBottom: 8 }}>{t.message}</label>
          <textarea
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            disabled={!session}
            rows={5}
            placeholder={t.describeRequest}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 10,
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.bg,
              color: theme.text,
              fontSize: 14,
              outline: "none",
              resize: "vertical",
              boxSizing: "border-box",
              fontFamily: "inherit",
              opacity: session ? 1 : 0.65,
            }}
          />
        </div>
        <button
          type="button"
          onClick={() => {
            if (!canSend || !session) return;
            appendStudentRequest({
              studentId: session.id,
              studentDisplayName: formatAuthDisplayName(session),
              studentEmail: session.email,
              subject: subject.trim(),
              message: msg.trim(),
            });
            setSent(true);
          }}
          style={{
            padding: "12px 28px",
            borderRadius: 10,
            background: canSend ? "#1d4ed8" : "#cbd5e1",
            color: "#fff",
            border: "none",
            fontWeight: 800,
            fontSize: 14,
            cursor: canSend ? "pointer" : "default",
          }}
        >
          {t.sendRequest}
        </button>
      </div>
    </div>
  );
}

// ─── CRÉER UN GROUPE ──────────────────────────────────────────────────────────
interface CreerGroupeProps {
  theme: Theme;
  t: TranslationStrings;
}

export function CreerGroupe({ theme, t }: CreerGroupeProps) {
  const session = useSession();
  const [name,    setName]    = useState("");
  const [type,    setType]    = useState("Mon Année");
  const [created, setCreated] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createErr, setCreateErr] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!name.trim()) return;
    if (!session) {
      setCreateErr("Connectez-vous pour créer un groupe.");
      return;
    }
    setCreating(true);
    setCreateErr(null);
    try {
      await postCreateConversation({
        nom: name.trim(),
        typeConversation: type,
        idCreateur: session.id,
      });
      setCreated(true);
    } catch (e) {
      setCreateErr(e instanceof Error ? e.message : "Échec de la création");
    } finally {
      setCreating(false);
    }
  };

  if (created) return (
    <div style={{ backgroundColor: "#d1fae5", border: "1px solid #6ee7b7", borderRadius: 16, padding: 32, textAlign: "center" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
      <div style={{ fontWeight: 800, color: "#065f46", fontSize: 18 }}>{t.groupCreated.replace("{name}", name)}</div>
      <button onClick={() => { setCreated(false); setName(""); }} style={{ marginTop: 16, padding: "10px 24px", borderRadius: 10, background: "#059669", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer" }}>{t.createAnotherGroup}</button>
    </div>
  );

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 900, color: theme.text, marginBottom: 20 }}>{t.createGroupTitle}</h2>
      {createErr && <div style={{ backgroundColor: "#fee2e2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", marginBottom: 14, color: "#b91c1c", fontSize: 13 }}>{createErr}</div>}
      <div style={{ backgroundColor: theme.surface, borderRadius: 16, padding: 28, border: `1px solid ${theme.border}`, maxWidth: 500 }}>
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: theme.textMuted, marginBottom: 8 }}>{t.groupName}</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: 2ème Année GI — Groupe B" style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${theme.border}`, backgroundColor: theme.bg, color: theme.text, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: theme.textMuted, marginBottom: 8 }}>{t.typeLabel}</label>
          <div style={{ display: "flex", gap: 10 }}>
            {(["Mon Année", "Général"] as const).map((typeOption) => (
              <button key={typeOption} onClick={() => setType(typeOption)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: `2px solid ${type === typeOption ? "#1d4ed8" : theme.border}`, background: type === typeOption ? "#dbeafe" : theme.bg, color: type === typeOption ? "#1d4ed8" : theme.textMuted, fontWeight: 700, cursor: "pointer" }}>{typeOption}</button>
            ))}
          </div>
        </div>
        <button type="button" disabled={!name.trim() || creating} onClick={() => void handleCreate()} style={{ width: "100%", padding: "13px", borderRadius: 10, background: name.trim() && !creating ? "#1d4ed8" : "#cbd5e1", color: "#fff", border: "none", fontWeight: 800, fontSize: 14, cursor: name.trim() && !creating ? "pointer" : "default" }}>
          {creating ? "Création…" : "Créer le groupe"}
        </button>
      </div>
    </div>
  );
}

// ─── PROFIL — VOIR ────────────────────────────────────────────────────────────
function nestedObj(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

interface ProfilVoirProps {
  theme: Theme;
  t?: TranslationStrings;
}

export function ProfilVoir({ theme }: ProfilVoirProps) {
  const session = useSession();
  const [loading, setLoading] = useState(false);
  const [raw, setRaw] = useState<Record<string, unknown> | null>(null);

  const apiRole = sessionProfileRole(session);

  useEffect(() => {
    if (!session || !apiRole) return;
    let cancel = false;
    (async () => {
      setLoading(true);
      try {
        const r = await fetchProfileRawByRole(apiRole, session.id);
        if (!cancel) setRaw(r);
      } catch {
        if (!cancel) setRaw(null);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [session, apiRole]);

  const prenom = (raw ? pickStr(raw, "prenom", "Prenom") : session?.firstname) ?? "";
  const nom = (raw ? pickStr(raw, "nom", "Nom") : session?.name) ?? "";
  const fullName =
    `${prenom} ${nom}`.trim() || formatAuthDisplayName(session) || "—";
  const initials =
    prenom && nom
      ? `${prenom.charAt(0) || "?"}${nom.charAt(0) || "?"}`.toUpperCase()
      : authUserInitials(session);
  const photoUrl =
    pickStr(raw ?? {}, "photoUrl", "PhotoUrl") || session?.photoUrl || undefined;
  const email =
    (raw ? pickStr(raw, "email", "Email") : session?.email) ?? "—";
  const tel = raw ? pickStr(raw, "numeroTelephone", "NumeroTelephone") ?? "—" : "—";
  const matricule = raw ? pickStr(raw, "matricule", "Matricule") ?? "—" : "—";
  const nv = nestedObj(raw?.niveauScolaire ?? raw?.NiveauScolaire);
  const anneeLabel = nv ? pickStr(nv, "nom", "Nom") ?? "—" : "—";
  const filiereLabel =
    raw?.filiere != null && raw?.filiere !== ""
      ? String(raw.filiere)
      : raw?.Filiere != null
        ? String(raw.Filiere)
        : "—";

  const roleSubtitle =
    apiRole === "etudiant"
      ? `Étudiant${anneeLabel !== "—" ? ` — ${anneeLabel}` : ""}`
      : apiRole === "enseignant"
        ? "Enseignant"
        : apiRole === "administrateur"
          ? "Administrateur"
          : "—";

  const info: [string, string][] =
    apiRole === "etudiant" && raw
      ? [
          ["Email", email],
          ["Téléphone", tel],
          ["Date de naissance", "—"],
          ["Ville", "—"],
          ["Filière", filiereLabel],
          ["Année", anneeLabel],
        ]
      : raw
        ? [
            ["Email", email],
            ["Téléphone", tel],
            ...(apiRole === "enseignant" ? [["Matricule", matricule] as [string, string]] : []),
          ]
        : [["Email", email], ["Téléphone", tel]];

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 900, color: theme.text, marginBottom: 20 }}>Mon profil</h2>
      {loading && <p style={{ color: theme.textMuted, fontSize: 13 }}>Chargement du profil…</p>}
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        {/* Avatar card */}
        <div style={{ backgroundColor: theme.surface, borderRadius: 20, padding: 32, border: `1px solid ${theme.border}`, width: 280, textAlign: "center", flexShrink: 0 }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: "50%",
              background: photoUrl ? "transparent" : "linear-gradient(135deg,#3b82f6,#8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              color: "#fff",
              fontWeight: 900,
              fontSize: 32,
              overflow: "hidden",
            }}
          >
            {photoUrl ? (
              <img src={photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              initials
            )}
          </div>
          <h3 style={{ margin: "0 0 4px", fontWeight: 900, color: theme.text, fontSize: 18 }}>{fullName}</h3>
          <div style={{ color: "#3b82f6", fontWeight: 700, fontSize: 13, marginBottom: 8 }}>{roleSubtitle}</div>
          {apiRole === "etudiant" && (
            <div style={{ color: theme.textMuted, fontSize: 12, marginBottom: 16 }}>Matricule : {matricule}</div>
          )}
          {apiRole === "enseignant" && matricule !== "—" && (
            <div style={{ color: theme.textMuted, fontSize: 12, marginBottom: 16 }}>Matricule : {matricule}</div>
          )}
          <div style={{ backgroundColor: theme.bg, borderRadius: 12, padding: "12px 16px", fontSize: 13, color: theme.textMuted, textAlign: "left", lineHeight: 1.6, fontStyle: "italic" }}>
            "Passionné par l'informatique et l'intelligence artificielle. En quête d'excellence académique à l'UPF."
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "center" }}>
            {["🇫🇷", "🇬🇧", "🇲🇦"].map((f, i) => <span key={i} style={{ fontSize: 20 }}>{f}</span>)}
          </div>
        </div>

        {/* Info + stats */}
        <div style={{ flex: 1, minWidth: 280, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ backgroundColor: theme.surface, borderRadius: 16, padding: 24, border: `1px solid ${theme.border}` }}>
            <div style={{ fontWeight: 800, color: theme.text, marginBottom: 16, fontSize: 15 }}>Informations personnelles</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {info.map(([label, val], i) => (
                <div key={i}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: theme.textMuted, marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 14, color: theme.text, fontWeight: 600 }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ backgroundColor: theme.surface, borderRadius: 16, padding: 24, border: `1px solid ${theme.border}` }}>
            <div style={{ fontWeight: 800, color: theme.text, marginBottom: 16, fontSize: 15 }}>Statistiques académiques</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
              {([["Moyenne","14.5/20","#3b82f6"],["Absences","4","#ef4444"],["Rang","12/45","#059669"]] as [string, string, string][]).map(([label, val, color], i) => (
                <div key={i} style={{ backgroundColor: theme.bg, borderRadius: 12, padding: "14px", textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color }}>{val}</div>
                  <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PROFIL — ÉDITER ──────────────────────────────────────────────────────────
interface ProfilEditerProps {
  theme: Theme;
  t?: TranslationStrings;
}

interface ProfileForm {
  nom: string;
  prenom: string;
  email: string;
  tel: string;
  ville: string;
  bio: string;
  [key: string]: string;
}

export function ProfilEditer({ theme }: ProfilEditerProps) {
  const session = useSession();
  const patchUser = usePatchAuthUser();
  const apiRole = sessionProfileRole(session);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ProfileForm>({
    nom: "",
    prenom: "",
    email: "",
    tel: "",
    ville: "",
    bio: "",
  });
  const [apiPhotoUrl, setApiPhotoUrl] = useState<string | null>(null);
  const [pendingPhotoUrl, setPendingPhotoUrl] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);

  useEffect(() => {
    if (!session) return;
    setForm((prev) => ({
      ...prev,
      prenom: session.firstname || prev.prenom,
      nom: session.name || prev.nom,
      email: session.email || prev.email,
    }));
    if (session.photoUrl) setApiPhotoUrl(session.photoUrl);
  }, [session?.id, session?.photoUrl]);

  useEffect(() => {
    if (!session || !apiRole) return;
    let cancel = false;
    (async () => {
      try {
        const r = await fetchProfileRawByRole(apiRole, session.id);
        if (cancel) return;
        setForm((prev) => ({
          ...prev,
          nom: pickStr(r, "nom", "Nom") ?? prev.nom,
          prenom: pickStr(r, "prenom", "Prenom") ?? prev.prenom,
          email: pickStr(r, "email", "Email") ?? prev.email,
          tel: pickStr(r, "numeroTelephone", "NumeroTelephone") ?? prev.tel,
        }));
        setApiPhotoUrl(pickStr(r, "photoUrl", "PhotoUrl") ?? null);
      } catch {
        /* hors ligne / démo */
      }
    })();
    return () => {
      cancel = true;
    };
  }, [session?.id, apiRole]);

  const avatarSrc = pendingPhotoUrl ?? apiPhotoUrl ?? session?.photoUrl;
  const avatarInitials = authUserInitials(session);

  const fields: Array<{ key: string; label: string; span?: number }> = [
    { key: "nom", label: "Nom" },
    { key: "prenom", label: "Prénom" },
    { key: "email", label: "Email", span: 2 },
    { key: "tel", label: "Téléphone" },
    { key: "ville", label: "Ville" },
  ];

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 900, color: theme.text, marginBottom: 4 }}>Éditer mon profil</h2>
      <p style={{ color: theme.textMuted, fontSize: 13, marginBottom: 20 }}>Mettez à jour vos informations personnelles</p>

      {saved && <div style={{ backgroundColor: "#d1fae5", border: "1px solid #6ee7b7", borderRadius: 10, padding: "12px 18px", marginBottom: 16, color: "#065f46", fontWeight: 700, fontSize: 13 }}>✅ Profil mis à jour avec succès !</div>}
      {saveErr && <div style={{ backgroundColor: "#fee2e2", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 18px", marginBottom: 16, color: "#b91c1c", fontWeight: 700, fontSize: 13 }}>{saveErr}</div>}

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (!f) return;
            void (async () => {
              setSaveErr(null);
              setPhotoBusy(true);
              try {
                const dataUrl = await fileToProfileDataUrl(f);
                setPendingPhotoUrl(dataUrl);
              } catch (err) {
                setSaveErr(err instanceof Error ? err.message : "Impossible de charger l’image");
              } finally {
                setPhotoBusy(false);
              }
            })();
          }}
        />
        {/* Avatar */}
        <div style={{ backgroundColor: theme.surface, borderRadius: 16, padding: 24, border: `1px solid ${theme.border}`, width: 220, textAlign: "center", flexShrink: 0 }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: avatarSrc ? "transparent" : "linear-gradient(135deg,#3b82f6,#8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
              color: "#fff",
              fontWeight: 900,
              fontSize: 28,
              overflow: "hidden",
            }}
          >
            {avatarSrc ? (
              <img src={avatarSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              avatarInitials
            )}
          </div>
          <button
            type="button"
            disabled={photoBusy || !apiRole}
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: `1px solid ${theme.border}`,
              background: theme.bg,
              color: theme.textMuted,
              fontSize: 12,
              fontWeight: 700,
              cursor: photoBusy || !apiRole ? "not-allowed" : "pointer",
              opacity: !apiRole ? 0.6 : 1,
            }}
          >
            {photoBusy ? "Traitement…" : "Changer la photo"}
          </button>
          {pendingPhotoUrl && (
            <button
              type="button"
              onClick={() => setPendingPhotoUrl(null)}
              style={{
                display: "block",
                margin: "10px auto 0",
                background: "none",
                border: "none",
                color: theme.textMuted,
                fontSize: 11,
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Annuler la nouvelle photo
            </button>
          )}
        </div>

        {/* Form */}
        <div style={{ flex: 1, minWidth: 280, backgroundColor: theme.surface, borderRadius: 16, padding: 24, border: `1px solid ${theme.border}` }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {fields.map(({ key, label, span }) => (
              <div key={key} style={{ gridColumn: span ? `span ${span}` : "span 1" }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: theme.textMuted, marginBottom: 6 }}>{label}</label>
                <input
                  value={form[key]}
                  onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: `1px solid ${theme.border}`, backgroundColor: theme.bg, color: theme.text, fontSize: 14, outline: "none", boxSizing: "border-box" }}
                />
              </div>
            ))}
            <div style={{ gridColumn: "span 2" }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: theme.textMuted, marginBottom: 6 }}>Description publique</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                rows={3}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: `1px solid ${theme.border}`, backgroundColor: theme.bg, color: theme.text, fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }}
              />
            </div>
          </div>
          <button
            type="button"
            disabled={saving || !apiRole}
            onClick={() => {
              void (async () => {
                setSaveErr(null);
                setSaved(false);
                if (!session || !apiRole) {
                  setSaveErr("Profil non synchronisable (rôle ou session manquant).");
                  return;
                }
                setSaving(true);
                try {
                  const r = await fetchProfileRawByRole(apiRole, session.id);
                  const body: Record<string, unknown> = { ...r };
                  stripProfileNavProps(body, apiRole);
                  body.nom = form.nom;
                  body.prenom = form.prenom;
                  body.email = form.email;
                  body.numeroTelephone = form.tel;
                  const prevPhoto = pickStr(r, "photoUrl", "PhotoUrl");
                  const nextPhoto = pendingPhotoUrl ?? prevPhoto ?? null;
                  body.photoUrl = nextPhoto;
                  await putProfileByRole(apiRole, session.id, body);
                  setApiPhotoUrl(nextPhoto);
                  setPendingPhotoUrl(null);
                  patchUser({
                    firstname: form.prenom,
                    name: form.nom,
                    photoUrl: nextPhoto ?? undefined,
                  });
                  setSaved(true);
                } catch (e) {
                  setSaveErr(e instanceof Error ? e.message : "Échec de l’enregistrement");
                } finally {
                  setSaving(false);
                }
              })();
            }}
            style={{ marginTop: 20, padding: "12px 28px", borderRadius: 10, background: saving ? "#93c5fd" : "#1d4ed8", color: "#fff", border: "none", fontWeight: 800, fontSize: 14, cursor: saving ? "wait" : "pointer" }}
          >
            {saving ? "Enregistrement…" : "Enregistrer les modifications"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DEFAULT EXPORTS (aliased for Dashboard import) ───────────────────────────
export default Messages;
