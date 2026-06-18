import { useState, useRef, useEffect } from "react";
import Icon from "../../components/shared/Icon";
import { ETUDIANTS_LIST, ABSENCES_DATA } from "../../data/mockData";
import { MATIERES, ANNEES } from "../../data/constants";
import type { Theme, TranslationStrings, Etudiant, AbsenceDataRow } from "../../types";
import {
  createAdministrateur,
  createEnseignant,
  createEtudiant,
  fetchFilieres,
  fetchNiveaux,
  type FiliereRow,
  type NiveauRow,
} from "../../services/adminProfilesApi";
import {
  buildAbsenceDataForStudents,
  fetchAllEtudiantsRaw,
  fetchAllMatieresRaw,
  fetchAllNiveauxRaw,
  filterMatieresByNiveauId,
  mapApiStudentToEtudiant,
  mapNiveauToOption,
  pickNum,
  pickStr,
} from "../../services/schoolApi";

// ─── AJOUTER EMPLOI DU TEMPS ──────────────────────────────────────────────────
interface AjouterEmploiProps {
  theme: Theme;
  t?: TranslationStrings;
}

interface FormField {
  label: string;
  type: "select" | "text";
  options?: string[];
  placeholder?: string;
}

export function AjouterEmploi({ theme }: AjouterEmploiProps) {
  const [niveauxTabs, setNiveauxTabs] = useState<{ id: number; nom: string }[]>([]);
  const [selectedNiveauId, setSelectedNiveauId] = useState<number | null>(null);
  const [niveauxLoading, setNiveauxLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [matiereOptions, setMatiereOptions] = useState<string[]>([]);
  const [matieresLoading, setMatieresLoading] = useState(false);
  const [selectedMatiere, setSelectedMatiere] = useState("");

  useEffect(() => {
    let cancel = false;
    (async () => {
      setNiveauxLoading(true);
      try {
        const raw = await fetchAllNiveauxRaw();
        if (cancel) return;
        const opts = raw
          .map(mapNiveauToOption)
          .filter((x): x is { id: number; nom: string } => x != null)
          .sort((a, b) => a.nom.localeCompare(b.nom, "fr", { sensitivity: "base" }));
        setNiveauxTabs(opts);
        setSelectedNiveauId((prev) => {
          if (prev != null && opts.some((o) => o.id === prev)) return prev;
          return opts[0]?.id ?? null;
        });
      } catch {
        if (!cancel) {
          setNiveauxTabs([]);
          setSelectedNiveauId(null);
        }
      } finally {
        if (!cancel) setNiveauxLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  useEffect(() => {
    if (selectedNiveauId == null) {
      setMatiereOptions([]);
      setSelectedMatiere("");
      return;
    }
    let cancel = false;
    (async () => {
      setMatieresLoading(true);
      try {
        const all = await fetchAllMatieresRaw();
        if (cancel) return;
        const filtered = filterMatieresByNiveauId(all, selectedNiveauId);
        const labels = filtered.map((m) => {
          const titre = pickStr(m, "titre", "Titre");
          const code = pickStr(m, "code", "Code");
          const idM = pickNum(m, "idMatiere", "IdMatiere");
          if (titre && code && titre !== code) return `${titre} (${code})`;
          return titre ?? code ?? (idM != null ? `Matière #${idM}` : "");
        });
        const unique = [...new Set(labels.filter((x) => x.trim() !== ""))].sort((a, b) =>
          a.localeCompare(b, "fr", { sensitivity: "base" })
        );
        setMatiereOptions(unique);
        setSelectedMatiere((prev) => (prev && unique.includes(prev) ? prev : unique[0] ?? ""));
      } catch {
        if (!cancel) {
          setMatiereOptions([]);
          setSelectedMatiere("");
        }
      } finally {
        if (!cancel) setMatieresLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [selectedNiveauId]);

  const selectedNiveauLabel = niveauxTabs.find((n) => n.id === selectedNiveauId)?.nom ?? "—";

  const formFieldsRest: FormField[] = [
    { label: "Enseignant", type: "text", placeholder: "Pr. Nom" },
    { label: "Salle", type: "text", placeholder: "A101" },
    { label: "Jour", type: "select", options: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"] },
  ];

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 900, color: theme.text, marginBottom: 4 }}>Ajouter un emploi du temps</h2>
      <p style={{ color: theme.textMuted, fontSize: 13, marginBottom: 20 }}>Gérez les emplois du temps de chaque année</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        {niveauxLoading && (
          <span style={{ color: theme.textMuted, fontSize: 13 }}>Chargement des années…</span>
        )}
        {!niveauxLoading && niveauxTabs.length === 0 && (
          <span style={{ color: theme.textMuted, fontSize: 13 }}>
            Aucun niveau scolaire en base. Ajoutez des niveaux via l’API (<code style={{ fontSize: 11 }}>CreateNiveau</code>) ou Swagger.
          </span>
        )}
        {!niveauxLoading &&
          niveauxTabs.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => setSelectedNiveauId(n.id)}
              style={{
                padding: "7px 16px",
                borderRadius: 8,
                border: `1px solid ${theme.border}`,
                background: selectedNiveauId === n.id ? "#1d4ed8" : theme.surface,
                color: selectedNiveauId === n.id ? "#fff" : theme.textMuted,
                fontWeight: 700,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              {n.nom}
            </button>
          ))}
      </div>

      {saved && (
        <div
          style={{
            backgroundColor: "#d1fae5",
            border: "1px solid #6ee7b7",
            borderRadius: 10,
            padding: "12px 18px",
            marginBottom: 16,
            color: "#065f46",
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          ✅ Emploi du temps enregistré pour {selectedNiveauLabel}
        </div>
      )}

      <div style={{ backgroundColor: theme.surface, borderRadius: 16, padding: 28, border: `1px solid ${theme.border}`, maxWidth: 520 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: theme.textMuted, marginBottom: 8 }}>Matière</label>
          <select
            value={selectedMatiere}
            onChange={(e) => setSelectedMatiere(e.target.value)}
            disabled={matieresLoading || selectedNiveauId == null || matiereOptions.length === 0}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 10,
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.bg,
              color: theme.text,
              fontSize: 14,
              outline: "none",
              opacity: matieresLoading || selectedNiveauId == null || matiereOptions.length === 0 ? 0.7 : 1,
            }}
          >
            {selectedNiveauId == null ? (
              <option value="">— Choisissez d’abord une année —</option>
            ) : matieresLoading ? (
              <option value="">Chargement des matières…</option>
            ) : matiereOptions.length === 0 ? (
              <option value="">Aucune matière en base pour ce niveau</option>
            ) : (
              matiereOptions.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))
            )}
          </select>
        </div>

        {formFieldsRest.map((f, i) => (
          <div key={f.label} style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: theme.textMuted, marginBottom: 8 }}>{f.label}</label>
            {f.type === "select" ? (
              <select style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${theme.border}`, backgroundColor: theme.bg, color: theme.text, fontSize: 14, outline: "none" }}>
                {f.options?.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ) : (
              <input placeholder={f.placeholder} style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${theme.border}`, backgroundColor: theme.bg, color: theme.text, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            )}
          </div>
        ))}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          {["Heure de début", "Heure de fin"].map((label, i) => (
            <div key={i}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: theme.textMuted, marginBottom: 8 }}>{label}</label>
              <input type="time" defaultValue={i === 0 ? "08:00" : "10:00"} style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${theme.border}`, backgroundColor: theme.bg, color: theme.text, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setSaved(true)} style={{ flex: 1, padding: "13px", borderRadius: 10, background: "#ea580c", color: "#fff", border: "none", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>Enregistrer</button>
          <button onClick={() => fileRef.current?.click()} style={{ padding: "13px 16px", borderRadius: 10, background: theme.surface, border: `1px solid ${theme.border}`, color: theme.text, fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="upload" size={14} /> Import fichier
          </button>
          <input ref={fileRef} type="file" accept=".pdf,.xlsx,.csv" style={{ display: "none" }} />
        </div>
      </div>
    </div>
  );
}

// ─── GESTION DES ABSENCES ─────────────────────────────────────────────────────
interface GestionAbsencesProps {
  theme: Theme;
  t?: TranslationStrings;
  userType?: string;
}

export function GestionAbsences({ theme }: GestionAbsencesProps) {
  const [selectedEtudiant, setSelectedEtudiant] = useState<Etudiant>(ETUDIANTS_LIST[0]);
  const [selectedAnnee,    setSelectedAnnee]    = useState("2GI");
  const [etudiantsList,    setEtudiantsList]    = useState<Etudiant[]>(ETUDIANTS_LIST);
  const [absData,          setAbsData]          = useState<AbsenceDataRow[]>(
    ABSENCES_DATA.map((r) => ({ ...r, seances: r.seances.map((s) => ({ ...s, presences: { ...s.presences } })) }))
  );

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const raw = await fetchAllEtudiantsRaw();
        if (cancel || !raw.length) return;
        const list = raw.map(mapApiStudentToEtudiant);
        setEtudiantsList(list);
        setAbsData(buildAbsenceDataForStudents(list, MATIERES));
        setSelectedEtudiant((prev) => list.find((e) => e.id === prev.id) ?? list[0] ?? prev);
      } catch {
        /* mock */
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const togglePresence = (mi: number, si: number) => {
    const etId = selectedEtudiant.id;
    setAbsData((prev) =>
      prev.map((row, idx) =>
        idx === mi
          ? { ...row, seances: row.seances.map((s, j) => j === si ? { ...s, presences: { ...s.presences, [etId]: !s.presences[etId] } } : s) }
          : row
      )
    );
  };

  const filteredData = absData.filter((r) => r.annee === selectedAnnee);

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 900, color: theme.text, marginBottom: 4 }}>Gérer les absences</h2>
      <p style={{ color: theme.textMuted, fontSize: 13, marginBottom: 20 }}>Marquez les absences par étudiant, matière et année</p>

      {/* Filters */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: theme.textMuted, display: "block", marginBottom: 6 }}>Année</label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {ANNEES.map((a) => (
              <button key={a} onClick={() => setSelectedAnnee(a)} style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${theme.border}`, background: selectedAnnee === a ? "#1d4ed8" : theme.surface, color: selectedAnnee === a ? "#fff" : theme.textMuted, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>{a}</button>
            ))}
          </div>
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: theme.textMuted, display: "block", marginBottom: 6 }}>Étudiant</label>
          <select value={selectedEtudiant.id} onChange={(e) => { const found = etudiantsList.find((et) => et.id === e.target.value); if (found) setSelectedEtudiant(found); }} style={{ padding: "9px 14px", borderRadius: 10, border: `1px solid ${theme.border}`, backgroundColor: theme.surface, color: theme.text, fontSize: 13, cursor: "pointer" }}>
            {etudiantsList.map((e) => <option key={e.id} value={e.id}>{e.nom}</option>)}
          </select>
        </div>
      </div>

      <div style={{ backgroundColor: theme.surface, borderRadius: 16, border: `1px solid ${theme.border}`, overflow: "auto", marginBottom: 16 }}>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${theme.border}`, fontWeight: 800, color: theme.text, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{selectedEtudiant.nom} — {selectedAnnee}</span>
          <span style={{ fontSize: 12, fontWeight: 400, color: theme.textMuted }}>Cliquez sur ✓/✗ pour modifier</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#1e3a8a" }}>
              <th style={{ padding: "12px 20px", textAlign: "left", color: "#93c5fd", fontSize: 12, fontWeight: 700 }}>Matière</th>
              {filteredData[0]?.seances.map((s) => <th key={s.date} style={{ padding: "12px 14px", textAlign: "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>{s.date}</th>)}
              <th style={{ padding: "12px 14px", textAlign: "center", color: "#93c5fd", fontSize: 12, fontWeight: 700 }}>Abs.</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, mi) => {
              const etId = selectedEtudiant.id;
              const abs = row.seances.filter((s) => !s.presences[etId]).length;
              return (
                <tr key={mi} style={{ borderBottom: `1px solid ${theme.border}`, backgroundColor: mi % 2 === 0 ? theme.surface : theme.bg }}>
                  <td style={{ padding: "11px 20px", fontWeight: 700, fontSize: 13, color: theme.text }}>{row.matiere}</td>
                  {row.seances.map((s, si) => {
                    const isPresent = !!s.presences[etId];
                    return (
                      <td key={si} style={{ padding: "11px 14px", textAlign: "center" }}>
                        <button onClick={() => togglePresence(absData.indexOf(row), si)} style={{ width: 30, height: 30, borderRadius: "50%", border: "none", cursor: "pointer", backgroundColor: isPresent ? "#dcfce7" : "#fee2e2", color: isPresent ? "#16a34a" : "#dc2626", fontWeight: 800, fontSize: 14 }}>
                          {isPresent ? "✓" : "✗"}
                        </button>
                      </td>
                    );
                  })}
                  <td style={{ padding: "11px 14px", textAlign: "center" }}>
                    <span style={{ backgroundColor: abs >= 3 ? "#fee2e2" : abs >= 1 ? "#fef3c7" : "#dcfce7", color: abs >= 3 ? "#dc2626" : abs >= 1 ? "#d97706" : "#16a34a", borderRadius: 8, padding: "3px 8px", fontSize: 12, fontWeight: 800 }}>{abs}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <button style={{ padding: "12px 28px", borderRadius: 10, background: "#ea580c", color: "#fff", border: "none", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
        Enregistrer les modifications
      </button>
    </div>
  );
}

// ─── GESTION DES PAIEMENTS ────────────────────────────────────────────────────
interface GestionPaiementsProps {
  theme: Theme;
  t?: TranslationStrings;
}

export function GestionPaiements({ theme }: GestionPaiementsProps) {
  const [etudiants, setEtudiants] = useState<Etudiant[]>(ETUDIANTS_LIST);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const raw = await fetchAllEtudiantsRaw();
        if (cancel || !raw.length) return;
        setEtudiants(raw.map(mapApiStudentToEtudiant));
      } catch {
        /* mock */
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const STATUS_COLORS: Record<string, string> = { "Complet": "#059669", "Partiel": "#d97706", "Non payé": "#dc2626" };
  const STATUS_BG: Record<string, string>     = { "Complet": "#d1fae5", "Partiel": "#fef3c7", "Non payé": "#fee2e2" };

  const updateStatut = (id: string, statut: string) =>
    setEtudiants((prev) => prev.map((e) => e.id === id ? { ...e, paiement: statut } : e));

  const headers = ["Matricule","Nom & Prénom","Année","Total","Payé","Reste","Statut","Modifier"];

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 900, color: theme.text, marginBottom: 4 }}>Gérer les paiements</h2>
      <p style={{ color: theme.textMuted, fontSize: 13, marginBottom: 20 }}>Consultez et mettez à jour le statut de paiement des étudiants</p>

      <div style={{ backgroundColor: theme.surface, borderRadius: 16, border: `1px solid ${theme.border}`, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#1e3a8a" }}>
              {headers.map((h) => <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "#fff", fontSize: 12, fontWeight: 700 }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {etudiants.map((e, i) => (
              <tr key={e.id} style={{ borderBottom: `1px solid ${theme.border}`, backgroundColor: i % 2 === 0 ? theme.surface : theme.bg }}>
                <td style={{ padding: "12px 16px", fontSize: 12, fontWeight: 700, color: "#3b82f6" }}>{e.id}</td>
                <td style={{ padding: "12px 16px", fontWeight: 700, color: theme.text, fontSize: 13 }}>{e.nom}</td>
                <td style={{ padding: "12px 16px" }}><span style={{ backgroundColor: "#dbeafe", color: "#1d4ed8", borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 700 }}>{e.annee}</span></td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: theme.text }}>{e.total.toLocaleString()} MAD</td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "#059669", fontWeight: 700 }}>{e.paye.toLocaleString()} MAD</td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "#ea580c", fontWeight: 700 }}>{(e.total - e.paye).toLocaleString()} MAD</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ backgroundColor: STATUS_BG[e.paiement] || "#f1f5f9", color: STATUS_COLORS[e.paiement] || "#64748b", borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 800 }}>{e.paiement}</span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <select value={e.paiement} onChange={(ev) => updateStatut(e.id, ev.target.value)} style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${theme.border}`, backgroundColor: theme.bg, color: theme.text, fontSize: 12, cursor: "pointer" }}>
                    {["Complet","Partiel","Non payé"].map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── CRÉER UN PROFIL ──────────────────────────────────────────────────────────
interface CreerProfilProps {
  theme: Theme;
  t?: TranslationStrings;
}

interface ProfileFormData {
  nom: string;
  prenom: string;
  email: string;
  matiere: string;
  matricule: string;
  [key: string]: string;
}

interface ProfileField {
  key: string;
  label: string;
  placeholder?: string;
  type?: string;
  options?: string[];
  span?: number;
}

export function CreerProfil({ theme }: CreerProfilProps) {
  const [role, setRole] = useState("etudiant");
  const [form, setForm] = useState<ProfileFormData>({ nom: "", prenom: "", email: "", matiere: "", matricule: "" });
  const [idFiliere, setIdFiliere] = useState(0);
  const [idNiveau, setIdNiveau] = useState(0);
  const [filieres, setFilieres] = useState<FiliereRow[]>([]);
  const [niveaux, setNiveaux] = useState<NiveauRow[]>([]);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [submitErr, setSubmitErr] = useState<string | null>(null);
  const [loadingLists, setLoadingLists] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(false);

  const roles = [
    { key: "etudiant", label: "Étudiant", icon: "🎓" },
    { key: "prof", label: "Enseignant", icon: "👨‍🏫" },
    { key: "admin", label: "Admin", icon: "⚙️" },
  ];

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingLists(true);
      setLoadErr(null);
      try {
        const [f, n] = await Promise.all([fetchFilieres(), fetchNiveaux()]);
        if (!cancelled) {
          setFilieres(f);
          setNiveaux(n);
        }
      } catch (e) {
        if (!cancelled) {
          const detail = e instanceof Error ? e.message : String(e);
          setLoadErr(
            `Impossible de charger filières / niveaux. Lancez l’API sur le port 5292, puis redémarrez « npm run dev » (proxy Vite). Détail : ${detail}`
          );
        }
      } finally {
        if (!cancelled) setLoadingLists(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const niveauxFiltres = niveaux.filter((n) => n.idFiliere === idFiliere);

  useEffect(() => {
    const list = niveaux.filter((n) => n.idFiliere === idFiliere);
    if (idNiveau && !list.some((n) => n.id === idNiveau)) setIdNiveau(0);
  }, [idFiliere, idNiveau, niveaux]);

  const baseFields: ProfileField[] = [
    { key: "nom", label: "Nom", placeholder: "Benali" },
    { key: "prenom", label: "Prénom", placeholder: "Youssef" },
    { key: "email", label: "Email", placeholder: "y.benali@upf.ac.ma", span: 2 },
  ];

  const fields: ProfileField[] = [
    ...baseFields,
    ...(role === "etudiant" || role === "prof"
      ? [{ key: "matricule", label: "Matricule", placeholder: role === "etudiant" ? "ET2025001" : "ENS2025001" }]
      : []),
    ...(role === "prof" ? [{ key: "matiere", label: "Matière principale (affichage)", type: "select", options: MATIERES }] : []),
  ];

  const canSubmitEtudiant =
    form.nom.trim() &&
    form.prenom.trim() &&
    form.email.trim() &&
    form.matricule.trim() &&
    idFiliere > 0 &&
    idNiveau > 0;
  const canSubmitProf =
    form.nom.trim() && form.prenom.trim() && form.email.trim() && form.matricule.trim();
  const canSubmitAdmin = form.nom.trim() && form.prenom.trim() && form.email.trim();
  const canSubmit =
    role === "etudiant" ? canSubmitEtudiant : role === "prof" ? canSubmitProf : canSubmitAdmin;

  const resetForm = () => {
    setForm({ nom: "", prenom: "", email: "", matiere: "", matricule: "" });
    setIdFiliere(0);
    setIdNiveau(0);
    setSubmitErr(null);
  };

  const handleCreate = async () => {
    if (!canSubmit || submitting) return;
    setSubmitErr(null);
    setSubmitting(true);
    try {
      if (role === "etudiant") {
        await createEtudiant({
          nom: form.nom,
          prenom: form.prenom,
          email: form.email,
          matricule: form.matricule,
          idFiliere,
          idNiveauScolaire: idNiveau,
        });
      } else if (role === "prof") {
        await createEnseignant({
          nom: form.nom,
          prenom: form.prenom,
          email: form.email,
          matricule: form.matricule,
        });
      } else {
        await createAdministrateur({
          nom: form.nom,
          prenom: form.prenom,
          email: form.email,
        });
      }
      setCreated(true);
      resetForm();
    } catch (e) {
      setSubmitErr(e instanceof Error ? e.message : "Échec de la création.");
    } finally {
      setSubmitting(false);
    }
  };

  if (created) {
    return (
      <div style={{ backgroundColor: "#d1fae5", border: "1px solid #6ee7b7", borderRadius: 16, padding: 32, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
        <div style={{ fontWeight: 800, color: "#065f46", fontSize: 18 }}>
          Profil {roles.find((r) => r.key === role)?.label} créé — enregistré en base.
        </div>
        <div style={{ color: "#047857", fontSize: 13, marginTop: 6 }}>
          Un email avec le mot de passe temporaire est envoyé si la configuration SMTP est correcte.
        </div>
        <button
          onClick={() => {
            setCreated(false);
            resetForm();
          }}
          style={{
            marginTop: 16,
            padding: "10px 24px",
            borderRadius: 10,
            background: "#059669",
            color: "#fff",
            border: "none",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Créer un autre profil
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 900, color: theme.text, marginBottom: 4 }}>Créer un profil</h2>
      <p style={{ color: theme.textMuted, fontSize: 13, marginBottom: 20 }}>
        Envoie une requête à l’API Banane : le compte est créé en base et le mot de passe généré côté serveur.
      </p>

      {loadErr && (
        <div
          style={{
            marginBottom: 16,
            padding: "12px 14px",
            borderRadius: 10,
            background: "#fef2f2",
            color: "#b91c1c",
            fontSize: 13,
          }}
        >
          {loadErr}
        </div>
      )}

      {loadingLists && !loadErr && (
        <p style={{ color: theme.textMuted, fontSize: 13, marginBottom: 12 }}>Chargement des filières et niveaux…</p>
      )}

      {!loadingLists && filieres.length === 0 && role === "etudiant" && (
        <div
          style={{
            marginBottom: 16,
            padding: "12px 14px",
            borderRadius: 10,
            background: "#fffbeb",
            color: "#92400e",
            fontSize: 13,
          }}
        >
          Aucune filière en base. Créez-en au moins une via Swagger (<code>CreateFiliere</code>) puis des niveaux (
          <code>CreateNiveau</code>) avant de créer un étudiant.
        </div>
      )}

      <div style={{ backgroundColor: theme.surface, borderRadius: 16, padding: 28, border: `1px solid ${theme.border}`, maxWidth: 540 }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          {roles.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => {
                setRole(r.key);
                setSubmitErr(null);
              }}
              style={{
                flex: 1,
                padding: "12px 8px",
                borderRadius: 12,
                border: `2px solid ${role === r.key ? "#1d4ed8" : theme.border}`,
                background: role === r.key ? "#dbeafe" : theme.bg,
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 4 }}>{r.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: role === r.key ? "#1d4ed8" : theme.textMuted }}>{r.label}</div>
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {role === "etudiant" && (
            <>
              <div style={{ gridColumn: "span 2" }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: theme.textMuted, marginBottom: 6 }}>Filière</label>
                <select
                  value={idFiliere || ""}
                  onChange={(e) => setIdFiliere(Number(e.target.value))}
                  disabled={loadingLists}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 10,
                    border: `1px solid ${theme.border}`,
                    backgroundColor: theme.bg,
                    color: theme.text,
                    fontSize: 14,
                    outline: "none",
                  }}
                >
                  <option value="">— Choisir —</option>
                  {filieres.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nom || f.code || `Filière #${f.id}`}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: theme.textMuted, marginBottom: 6 }}>
                  Niveau scolaire
                </label>
                <select
                  value={idNiveau || ""}
                  onChange={(e) => setIdNiveau(Number(e.target.value))}
                  disabled={!idFiliere || niveauxFiltres.length === 0}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 10,
                    border: `1px solid ${theme.border}`,
                    backgroundColor: theme.bg,
                    color: theme.text,
                    fontSize: 14,
                    outline: "none",
                  }}
                >
                  <option value="">— Choisir —</option>
                  {niveauxFiltres.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.nom}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {fields.map(({ key, label, placeholder, type, options, span }) => (
            <div key={key} style={{ gridColumn: span ? `span ${span}` : "span 1" }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: theme.textMuted, marginBottom: 6 }}>{label}</label>
              {type === "select" ? (
                <select
                  value={form[key]}
                  onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 10,
                    border: `1px solid ${theme.border}`,
                    backgroundColor: theme.bg,
                    color: theme.text,
                    fontSize: 14,
                    outline: "none",
                  }}
                >
                  {options?.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  value={form[key]}
                  onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                  disabled={submitting}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 10,
                    border: `1px solid ${theme.border}`,
                    backgroundColor: theme.bg,
                    color: theme.text,
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {submitErr && (
          <div
            style={{
              marginTop: 16,
              padding: "10px 12px",
              borderRadius: 10,
              background: "#fef2f2",
              color: "#b91c1c",
              fontSize: 12,
              lineHeight: 1.45,
              wordBreak: "break-word",
            }}
          >
            {submitErr}
          </div>
        )}

        <button
          type="button"
          onClick={() => void handleCreate()}
          disabled={!canSubmit || submitting || loadingLists}
          style={{
            width: "100%",
            marginTop: 24,
            padding: "13px",
            borderRadius: 10,
            background: canSubmit && !submitting && !loadingLists ? "#1d4ed8" : "#cbd5e1",
            color: "#fff",
            border: "none",
            fontWeight: 800,
            fontSize: 14,
            cursor: canSubmit && !submitting && !loadingLists ? "pointer" : "default",
          }}
        >
          {submitting ? "Création…" : "Créer le profil"}
        </button>
      </div>
    </div>
  );
}

// ─── DEFAULT EXPORT ───────────────────────────────────────────────────────────
export default AjouterEmploi;
