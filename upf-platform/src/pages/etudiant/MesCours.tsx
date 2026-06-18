import { useState, useEffect, useMemo } from "react";
import Icon from "../../components/shared/Icon";
import { coursDataTenSemestersFallback } from "../../data/mockData";
import { COLORS_MATIERES, TYPE_COLORS, TYPE_ICONS } from "../../data/constants";
import type { Theme, UserType, TranslationStrings, CoursItem, CoursData, Lang } from "../../types";
import {
  MAX_SEMESTRES,
  buildCoursDataFromApi,
  fetchAllDocumentsRaw,
  fetchAllMatieresRaw,
  fetchAllNiveauxRaw,
  fetchEtudiantRaw,
  getEtudiantYearRank,
  mergeNiveauIdsForRanking,
  studentMaxSemestreInclusive,
} from "../../services/schoolApi";
import { useSession } from "../../context/SessionContext";

interface MesCoursProps {
  theme: Theme;
  userType: UserType;
  t: TranslationStrings;
  lang: Lang;
}

function semesterTabLabel(t: TranslationStrings, n: number, lang: Lang): string {
  if (n === 1) return t.semester1;
  if (n === 2) return t.semester2;
  if (lang === "EN") return `Semester ${n}`;
  if (lang === "AR") return `الفصل الدراسي ${n}`;
  return `Semestre ${n}`;
}

interface UploadedFile {
  titre: string;
  name: string;
  size: string;
  type: string;
  date: string;
}

// ─── MES COURS ────────────────────────────────────────────────────────────────
export default function MesCours({ theme, userType, t, lang }: MesCoursProps) {
  const session = useSession();
  const canUpload = userType === "prof" || userType === "administration";

  const [semestre, setSemestre] = useState("Semestre 1");
  const [selectedMatiere, setSelectedMatiere] = useState<string | null>(null);
  const [filter, setFilter] = useState(t.all);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [fileTitle, setFileTitle] = useState("");
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [coursData, setCoursData] = useState<CoursData>(() => coursDataTenSemestersFallback());
  const [studentMaxSem, setStudentMaxSem] = useState(2);

  const tabSemesterNumbers = useMemo(() => {
    const n = userType === "etudiant" ? studentMaxSem : MAX_SEMESTRES;
    return Array.from({ length: n }, (_, i) => i + 1);
  }, [userType, studentMaxSem]);

  useEffect(() => {
    const m = /^Semestre (\d+)/.exec(semestre);
    const cur = m ? Number(m[1]) : 1;
    if (!tabSemesterNumbers.includes(cur)) {
      setSemestre(`Semestre ${tabSemesterNumbers[0] ?? 1}`);
    }
  }, [tabSemesterNumbers, semestre]);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const [m, d, n] = await Promise.all([fetchAllMatieresRaw(), fetchAllDocumentsRaw(), fetchAllNiveauxRaw()]);
        if (cancel) return;
        const ordered = mergeNiveauIdsForRanking(n, m);
        let maxInclusive = MAX_SEMESTRES;
        if (userType === "etudiant") {
          if (session) {
            try {
              const raw = await fetchEtudiantRaw(session.id);
              const rank = getEtudiantYearRank(raw, ordered);
              maxInclusive = studentMaxSemestreInclusive(rank);
            } catch {
              maxInclusive = 2;
            }
          } else {
            maxInclusive = 2;
          }
          setStudentMaxSem(maxInclusive);
        } else {
          setStudentMaxSem(MAX_SEMESTRES);
        }
        if (!m.length && !d.length) return;
        setCoursData(
          buildCoursDataFromApi(m, d, ordered, userType === "etudiant" ? { maxSemestreInclusive: maxInclusive } : undefined)
        );
      } catch {
        /* données démo */
      }
    })();
    return () => {
      cancel = true;
    };
  }, [userType, session?.id]);

  const semData = coursData[semestre] ?? [];
  const matiereData = selectedMatiere ? semData.find((m) => m.matiere === selectedMatiere) : null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileToUpload(e.target.files?.[0] ?? null);
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileTitle || !fileToUpload) return;
    setUploadedFiles((prev) => [
      ...prev,
      {
        titre: fileTitle,
        name: fileToUpload.name,
        size: (fileToUpload.size / 1024).toFixed(1) + " KB",
        type: "Cours",
        date: new Date().toLocaleDateString("fr"),
      },
    ]);
    setShowUploadForm(false);
    setFileTitle("");
    setFileToUpload(null);
  };

  const handleDeleteFile = (idx: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const filteredCours: Array<CoursItem | UploadedFile> = matiereData
    ? [...matiereData.cours, ...uploadedFiles].filter(
        (c) => filter === t.all || c.type === filter
      )
    : [];

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: theme.text, margin: 0 }}>{t.myCourses}</h2>
        {canUpload && selectedMatiere && !showUploadForm && (
          <button
            onClick={() => setShowUploadForm(true)}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 10, background: "#1d4ed8", color: "#fff", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
          >
            <Icon name="upload" size={14} /> {t.addFile}
          </button>
        )}
      </div>

      {/* Formulaire d'import pour prof */}
      {canUpload && selectedMatiere && showUploadForm && (
        <form onSubmit={handleUpload} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 20, marginBottom: 18, display: "flex", alignItems: "center", gap: 14 }}>
          <input
            type="text"
            placeholder="Titre du fichier"
            value={fileTitle}
            onChange={e => setFileTitle(e.target.value)}
            style={{ flex: 2, padding: 8, borderRadius: 8, border: `1px solid ${theme.border}`, fontSize: 13 }}
            required
          />
          <input
            type="file"
            onChange={handleFileChange}
            style={{ flex: 2, padding: 8, borderRadius: 8, border: `1px solid ${theme.border}`, fontSize: 13 }}
            required
          />
          <button
            type="submit"
            style={{ flex: 1, padding: "9px 18px", borderRadius: 10, background: "#1d4ed8", color: "#fff", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
          >
            Ajouter
          </button>
          <button
            type="button"
            onClick={() => setShowUploadForm(false)}
            style={{ flex: 1, padding: "9px 18px", borderRadius: 10, background: theme.surface, color: theme.text, border: `1px solid ${theme.border}`, fontWeight: 700, fontSize: 13, cursor: "pointer" }}
          >
            Annuler
          </button>
        </form>
      )}

      {/* Semester tabs (administration / prof : 10 semestres ; étudiant : jusqu’à 2 × année) */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        {tabSemesterNumbers.map((num) => {
          const label = semesterTabLabel(t, num, lang);
          const keyStr = `Semestre ${num}`;
          return (
            <button
              key={keyStr}
              onClick={() => {
                setSemestre(keyStr);
                setSelectedMatiere(null);
                setFilter(t.all);
              }}
              style={{
                padding: "8px 16px",
                borderRadius: 10,
                border: `1px solid ${theme.border}`,
                background: semestre === keyStr ? "#1d4ed8" : theme.surface,
                color: semestre === keyStr ? "#fff" : theme.textMuted,
                fontWeight: 700,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {!selectedMatiere ? (
        /* Matières grid */
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 14 }}>
          {semData.map((m) => (
            <button
              key={m.matiere}
              onClick={() => setSelectedMatiere(m.matiere)}
              style={{ backgroundColor: theme.surface, borderRadius: 14, padding: 20, border: `1px solid ${theme.border}`, cursor: "pointer", textAlign: "left", transition: "transform 0.15s" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.transform = "translateY(0)")}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: (COLORS_MATIERES[m.matiere] || "#64748b") + "20", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, fontSize: 18 }}>📘</div>
              <div style={{ fontWeight: 800, color: theme.text, fontSize: 14, marginBottom: 6 }}>{m.matiere}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {Object.keys(TYPE_COLORS).map((type) => (
                  <span key={type} style={{ fontSize: 10, backgroundColor: (TYPE_COLORS[type] || "#64748b") + "20", color: TYPE_COLORS[type] || "#64748b", borderRadius: 6, padding: "2px 6px", fontWeight: 700 }}>
                    {m.cours.filter((c) => c.type === type).length} {type}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      ) : (
        /* Cours list */
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
          <button
            onClick={() => { setSelectedMatiere(null); setFilter(t.all); }}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: theme.textMuted, cursor: "pointer", fontSize: 13 }}
          >
            {t.backToSubjects}
          </button>
          {[t.all, ...Object.keys(TYPE_COLORS)].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{ padding: "6px 16px", borderRadius: 8, border: `1px solid ${theme.border}`, background: filter === f ? (TYPE_COLORS[f] || "#1d4ed8") : theme.surface, color: filter === f ? "#fff" : theme.textMuted, fontWeight: 700, fontSize: 12, cursor: "pointer" }}
            >
              {f}
            </button>
          ))}
        </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filteredCours.map((c, idx) => {
              const item = c as CoursItem & UploadedFile;
              return (
                <div key={idx} style={{ backgroundColor: theme.surface, borderRadius: 12, padding: "14px 18px", border: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ fontSize: 20 }}>{TYPE_ICONS[item.type] || "📎"}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: theme.text }}>{item.titre || item.name}</div>
                    <div style={{ fontSize: 12, color: theme.textMuted }}>{item.fichier || item.name} · {item.date} · {item.size}</div>
                  </div>
                  <span style={{ fontSize: 11, backgroundColor: (TYPE_COLORS[item.type] || "#64748b") + "20", color: TYPE_COLORS[item.type] || "#64748b", borderRadius: 6, padding: "3px 8px", fontWeight: 700 }}>
                    {item.type}
                  </span>
                  <button style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: "#1d4ed8", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                      <Icon name="download" size={12} /> {t.download}
                  </button>
                  {canUpload && (
                    <button
                      onClick={() => handleDeleteFile(idx)}
                      style={{ padding: "7px 10px", borderRadius: 8, border: "none", background: "#ef4444", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", marginLeft: 8 }}
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
