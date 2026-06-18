import { useState, useRef } from "react";
import Icon from "../../components/shared/Icon";
import type { Theme, UserType, TranslationStrings, ChatMessage } from "../../types";

interface MesGroupesProps {
  theme: Theme;
  userType: UserType;
  t: TranslationStrings;
  initialGroup?: string | null;
}

const INITIAL_MSGS: ChatMessage[] = [
  { from: "Pr. Tazi",    text: "Rappel: TD informatique demain à 10h",  mine: false, time: "09:15", type: "text" },
  { from: "Moi",        text: "Merci professeur!",                       mine: true,  time: "09:20", type: "text" },
  { from: "Fatima Z.",  text: "Est-ce qu'on doit ramener le TP?",        mine: false, time: "09:22", type: "text" },
];

// ─── MES GROUPES (CHAT) ────────────────────────────────────────────────────────
export default function MesGroupes({ theme, userType, t }: MesGroupesProps) {
  const canCreateGroup  = ["admin", "administration"].includes(userType);
  const [activeGroup, setActiveGroup] = useState("Mon Année — 2GI");
  const [msgInput,    setMsgInput]    = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [msgs,        setMsgs]        = useState<ChatMessage[]>(INITIAL_MSGS);
  const fileRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const groups = ["Mon Année — 2GI", "Général", ...(canCreateGroup ? [t.createGroupLabel] : [])];

  const send = () => {
    if (!msgInput.trim()) return;
    const newMsg: ChatMessage = {
      from: "Moi",
      text: msgInput,
      mine: true,
      time: new Date().toLocaleTimeString("fr", { hour: "2-digit", minute: "2-digit" }),
      type: "text",
    };
    setMsgs((prev) => [...prev, newMsg]);
    setMsgInput("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileUrl = URL.createObjectURL(file);
    setMsgs((prev) => [...prev, {
      from: "Moi",
      text: file.name,
      mine: true,
      time: new Date().toLocaleTimeString("fr", { hour: "2-digit", minute: "2-digit" }),
      type: "file",
      fileName: file.name,
      fileType: file.type,
      fileUrl,
    }]);
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;

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

        const voiceMsg: ChatMessage = {
          from: "Moi",
          text: t.voiceNote,
          mine: true,
          time: new Date().toLocaleTimeString("fr", { hour: "2-digit", minute: "2-digit" }),
          type: "voice",
          voiceUrl,
        };
        setMsgs((prev) => [...prev, voiceMsg]);
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
      {/* Groups list */}
      <div className="splitView__left" style={{ backgroundColor: theme.surface, borderRadius: 14, border: `1px solid ${theme.border}`, padding: 12 }}>
        <div style={{ fontWeight: 800, fontSize: 13, color: theme.text, marginBottom: 12 }}>{t.myGroups}</div>
        {groups.map((g) => (
          <button
            key={g}
            onClick={() => g !== t.createGroupLabel && setActiveGroup(g)}
            style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "none", background: activeGroup === g ? "#1d4ed8" : g === t.createGroupLabel ? "#ea580c15" : "transparent", color: activeGroup === g ? "#fff" : g === t.createGroupLabel ? "#ea580c" : theme.text, fontWeight: 700, fontSize: 12, cursor: "pointer", textAlign: "left", marginBottom: 4 }}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Chat window */}
      <div className="splitView__right" style={{ flex: 1, backgroundColor: theme.surface, borderRadius: 14, border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${theme.border}`, fontWeight: 800, fontSize: 15, color: theme.text }}>
          💬 {activeGroup}
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          {msgs.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.mine ? "flex-end" : "flex-start" }}>
              <div style={{ maxWidth: "70%", backgroundColor: m.mine ? "#1d4ed8" : theme.bg, borderRadius: m.mine ? "14px 14px 4px 14px" : "14px 14px 14px 4px", padding: "10px 14px" }}>
                {!m.mine && <div style={{ fontSize: 11, fontWeight: 700, color: "#3b82f6", marginBottom: 4 }}>{m.from}</div>}
                {m.type === "file" && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <span>{t.fileUploaded}: {m.fileName || m.text}</span>
                    <a href={m.fileUrl} download={m.fileName || m.text} style={{ color: "#fff", textDecoration: "underline" }}>{t.download}</a>
                  </div>
                )}
                {m.type === "voice" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span>{t.voiceNote}</span>
                    <audio controls src={m.voiceUrl} style={{ width: "100%" }} />
                  </div>
                )}
                {m.type === "text" && <div style={{ fontSize: 14, color: m.mine ? "#fff" : theme.text }}>{m.text}</div>}
                <div style={{ fontSize: 10, color: m.mine ? "rgba(255,255,255,0.6)" : theme.textMuted, textAlign: "right", marginTop: 4 }}>{m.time}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Input bar */}
        <div style={{ padding: 14, borderTop: `1px solid ${theme.border}`, display: "flex", gap: 8, alignItems: "center" }}>
          <input ref={fileRef} type="file" style={{ display: "none" }} onChange={handleFileUpload} />

          {/* Upload */}
          <button onClick={() => fileRef.current?.click()} style={{ padding: "9px", borderRadius: 10, border: `1px solid ${theme.border}`, background: theme.bg, color: theme.textMuted, cursor: "pointer", display: "flex" }}>
            <Icon name="upload" size={16} />
          </button>

          {/* Voice */}
          <button
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onMouseLeave={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            style={{ padding: "9px", borderRadius: 10, border: `1px solid ${isRecording ? "#ef4444" : theme.border}`, background: isRecording ? "#fee2e2" : theme.bg, color: isRecording ? "#ef4444" : theme.textMuted, cursor: "pointer", display: "flex" }}
          >
            <Icon name="mic" size={16} />
          </button>

          <input
            value={msgInput}
            onChange={(e) => setMsgInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={isRecording ? t.recording : t.messagePlaceholder}
            style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: `1px solid ${theme.border}`, backgroundColor: theme.bg, color: theme.text, fontSize: 14, outline: "none" }}
          />

          <button onClick={send} style={{ padding: "10px 16px", borderRadius: 10, background: "#1d4ed8", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 13 }}>
            <Icon name="send" size={14} /> {t.send}
          </button>
        </div>
      </div>
    </div>
  );
}
