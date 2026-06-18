import { useState, useEffect, useMemo } from "react";
import { EMPLOI as MOCK_EMPLOI } from "../../data/mockData";
import { COLORS_MATIERES, ANNEES } from "../../data/constants";
import type { Theme, UserType, TranslationStrings, Emploi } from "../../types";
import {
  fetchAllMatieresRaw,
  fetchAllNiveauxRaw,
  filterMatieresByNiveauId,
  mapNiveauToOption,
  matieresToEmploi,
} from "../../services/schoolApi";

interface EmploiDuTempsProps {
  theme: Theme;
  userType: UserType;
  t: TranslationStrings;
}

// ─── EMPLOI DU TEMPS ──────────────────────────────────────────────────────────
export default function EmploiDuTemps({ theme, userType, t }: EmploiDuTempsProps) {
  const isProf = userType === "prof";
  const isAdministration = userType === "administration";

  const [anneeFilter, setAnneeFilter] = useState("2GI");
  const [allMatieres, setAllMatieres] = useState<Record<string, unknown>[]>([]);
  const [niveaux, setNiveaux] = useState<{ id: number; nom: string }[]>([]);
  const [selectedNiveauId, setSelectedNiveauId] = useState<number | null>(null);
  const [niveauxLoading, setNiveauxLoading] = useState(false);

  const joursLabels = useMemo(
    () => (t.days?.length ? t.days : MOCK_EMPLOI.jours) as string[],
    [t.days]
  );

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const m = await fetchAllMatieresRaw();
        if (cancel) return;
        if (isAdministration) {
          setAllMatieres(m);
        } else if (m.length) {
          setAllMatieres(m);
        }
      } catch {
        /* mock / hors ligne */
      }
    })();
    return () => {
      cancel = true;
    };
  }, [isAdministration]);

  useEffect(() => {
    if (!isAdministration) return;
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
        setNiveaux(opts);
        setSelectedNiveauId((prev) => {
          if (prev != null && opts.some((o) => o.id === prev)) return prev;
          return opts[0]?.id ?? null;
        });
      } catch {
        if (!cancel) {
          setNiveaux([]);
          setSelectedNiveauId(null);
        }
      } finally {
        if (!cancel) setNiveauxLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [isAdministration]);

  const displayEmploi: Emploi = useMemo(() => {
    if (isAdministration) {
      if (selectedNiveauId == null) return matieresToEmploi([], joursLabels);
      const filtered = filterMatieresByNiveauId(allMatieres, selectedNiveauId);
      return matieresToEmploi(filtered, joursLabels);
    }
    if (!allMatieres.length) return MOCK_EMPLOI;
    return matieresToEmploi(allMatieres, joursLabels);
  }, [isAdministration, selectedNiveauId, allMatieres, joursLabels]);

  const selectedNiveauNom = niveaux.find((n) => n.id === selectedNiveauId)?.nom;

  const subtitle = isAdministration
    ? niveauxLoading
      ? t.adminTimetableLoadingLevels
      : selectedNiveauNom
        ? selectedNiveauNom
        : t.adminTimetableHint
    : isProf
      ? t.viewAllTimetables
      : t.secondYear;

  const showAdminEmptyCourses =
    isAdministration &&
    !niveauxLoading &&
    selectedNiveauId != null &&
    niveaux.length > 0 &&
    displayEmploi.cours.length === 0;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: theme.text, margin: 0 }}>{t.timetable}</h2>
          <p style={{ color: theme.textMuted, fontSize: 13, margin: "4px 0 0" }}>{subtitle}</p>
          {showAdminEmptyCourses && (
            <p style={{ color: theme.textMuted, fontSize: 12, margin: "6px 0 0", fontStyle: "italic" }}>{t.adminTimetableNoCoursesForLevel}</p>
          )}
        </div>
        {isAdministration && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <label htmlFor="admin-emploi-niveau" style={{ fontSize: 12, fontWeight: 700, color: theme.textMuted }}>
              {t.adminTimetableSelectLabel}
            </label>
            <select
              id="admin-emploi-niveau"
              value={selectedNiveauId ?? ""}
              disabled={niveauxLoading || niveaux.length === 0}
              onChange={(e) => {
                const v = e.target.value;
                setSelectedNiveauId(v === "" ? null : Number(v));
              }}
              style={{
                padding: "9px 14px",
                borderRadius: 10,
                border: `1px solid ${theme.border}`,
                backgroundColor: theme.bg,
                color: theme.text,
                fontSize: 13,
                fontWeight: 600,
                minWidth: 220,
                cursor: niveauxLoading || niveaux.length === 0 ? "not-allowed" : "pointer",
              }}
            >
              {niveaux.length === 0 && !niveauxLoading ? (
                <option value="">{t.adminTimetableNoLevels}</option>
              ) : (
                niveaux.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.nom}
                  </option>
                ))
              )}
            </select>
          </div>
        )}
        {isProf && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {ANNEES.map((a) => (
              <button
                key={a}
                onClick={() => setAnneeFilter(a)}
                style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${theme.border}`, background: anneeFilter === a ? "#1d4ed8" : theme.surface, color: anneeFilter === a ? "#fff" : theme.textMuted, fontWeight: 700, fontSize: 12, cursor: "pointer" }}
              >
                {a}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div style={{ backgroundColor: theme.surface, borderRadius: 16, border: `1px solid ${theme.border}`, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
          <thead>
            <tr>
              <th style={{ padding: "12px 16px", backgroundColor: "#1e3a8a", color: "#93c5fd", fontSize: 11, fontWeight: 700, textAlign: "left", width: 80 }}>{t.hour}</th>
              {(t.days || displayEmploi.jours).map((j) => (
                <th key={j} style={{ padding: "12px 16px", backgroundColor: "#1e3a8a", color: "#fff", fontSize: 12, fontWeight: 700, textAlign: "center" }}>{j}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayEmploi.heures.map((h, hi) => (
              <tr key={h} style={{ borderBottom: `1px solid ${theme.border}` }}>
                <td style={{ padding: "10px 16px", fontSize: 12, color: theme.textMuted, fontWeight: 600, backgroundColor: theme.bg }}>{h}</td>
                {displayEmploi.jours.map((_, ji) => {
                  const cours = displayEmploi.cours.find((c) => c.jour === ji && c.debut === hi);
                  const isCovered = displayEmploi.cours.find((c) => c.jour === ji && c.debut < hi && c.debut + c.duree > hi);
                  if (isCovered) return null;
                  if (cours) return (
                    <td key={ji} rowSpan={cours.duree} style={{ padding: 6 }}>
                      <div style={{ backgroundColor: (COLORS_MATIERES[cours.matiere] || "#64748b") + "20", border: `2px solid ${COLORS_MATIERES[cours.matiere] || "#64748b"}`, borderRadius: 10, padding: "8px 10px", minHeight: cours.duree * 44 - 12 }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: COLORS_MATIERES[cours.matiere] || "#64748b" }}>{cours.matiere}</div>
                        <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 2 }}>{cours.salle}</div>
                        <div style={{ fontSize: 11, color: theme.textMuted }}>{cours.prof}</div>
                      </div>
                    </td>
                  );
                  return <td key={ji} style={{ padding: 6 }} />;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 16 }}>
        {Object.entries(COLORS_MATIERES).map(([m, c]) => (
          <div key={m} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: theme.textMuted }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: c }} />
            {m}
          </div>
        ))}
      </div>
    </div>
  );
}
