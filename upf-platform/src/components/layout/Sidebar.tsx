import { useState } from "react";
import Icon from "../shared/Icon";
import type { Theme, UserType, TranslationStrings, Lang } from "../../types";

interface NavItemData {
  key: string;
  label: string;
  icon: string;
  highlight?: boolean;
  subItems?: NavItemData[];
}

interface SidebarProps {
  theme: Theme;
  userType: UserType;
  activeSection: string;
  setActiveSection: (key: string) => void;
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: TranslationStrings;
  open: boolean;
  onClose: () => void;
}

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────
export default function Sidebar({ theme, userType, activeSection, setActiveSection, lang, setLang, t, open }: SidebarProps) {
  const [openGroup, setOpenGroup] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupKey: string) => {
    setOpenGroup((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const isAdmin = userType === "admin";
  const isAdministration = userType === "administration";
  const isProf = userType === "prof";
  const isEtudiant = userType === "etudiant";

  const roleLabel = ({
    etudiant: "Étudiant",
    prof: "Enseignant",
    admin: "Admin",
    administration: "Administration",
  } as Record<UserType, string>)[userType];

  const navGroups: Array<{ key: string; label: string; items: NavItemData[] }> = [
    {
      key: "elearning",
      label: t.elearning,
      items: [
        { key: "emploi", label: t.emploi, icon: "calendar" },
        { key: "cours", label: t.cours, icon: "book" },
      ],
    },
    {
      key: "chat",
      label: t.chat,
      items: [
        { key: "groupes", label: t.groupes, icon: "users" },
        { key: "messages", label: t.messages, icon: "message" },
      ],
    },
    {
      key: "navigation",
      label: t.navigation,
      items: [
        { key: "home", label: t.accueil, icon: "home" },
        ...(isEtudiant || isAdmin || isAdministration
          ? [
              {
                key: "espace-admin",
                label: isAdministration ? t.espaceRequetesEtudiant : t.espaceEtudiantAdmin,
                icon: "shield",
              },
              ...(isEtudiant || isAdmin
                ? [
                    { key: "absences", label: t.absences, icon: "alert" },
                    { key: "scolarite", label: t.scolarite, icon: "wallet" },
                  ]
                : []),
            ]
          : []),
        ...(isAdmin || isProf
          ? [
              { key: "creer-groupe", label: t.createGroup, icon: "plus", highlight: true },
              ...(isProf ? [{ key: "gestion-absences", label: t.manageAbsences, icon: "alert", highlight: true }] : []),
            ]
          : []),
        ...(isAdministration
          ? [
              { key: "emploi-add", label: t.addSchedule, icon: "calendar", highlight: true },
              { key: "gestion-absences", label: t.manageAbsences, icon: "alert", highlight: true },
              { key: "gestion-paiements", label: t.managePayments, icon: "wallet", highlight: true },
              { key: "creer-profil", label: t.createProfile, icon: "userplus", highlight: true },
              { key: "creer-groupe", label: t.createGroup, icon: "plus", highlight: true },
            ]
          : []),
      ],
    },
  ];

  return (
    <aside className={`sidebar${open ? " open" : ""}`} style={{ backgroundColor: theme.sidebar }}>
      {/* Logo */}
      <div style={{ padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <img
            src="/images/logo-upf-2018-sidebar.png"
            alt="UPF"
            decoding="async"
            style={{
              width: "100%",
              maxHeight: 72,
              objectFit: "contain",
              objectPosition: "left center",
              display: "block",
            }}
          />
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 13 }}>{t.campus}</div>
            <div style={{ color: "#93c5fd", fontSize: 10 }}>{roleLabel}</div>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <div style={{ padding: "8px 8px", flex: 1 }}>
        {navGroups.map((group) => (
          <div key={group.key}>
            <div
              onClick={() => toggleGroup(group.key)}
              style={{
                color: "#ea580c",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1,
                padding: "12px 10px 6px",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              {group.label}
            </div>
            {openGroup[group.key] &&
              group.items.map((item) => (
                <div key={item.key}>
                  <NavItem
                    item={item}
                    active={activeSection === item.key}
                    onClick={() => setActiveSection(item.key)}
                  />
                  {item.subItems &&
                    openGroup[item.key] &&
                    item.subItems.map((subItem) => (
                      <div key={subItem.key} style={{ paddingLeft: 20 }}>
                        <NavItem
                          item={subItem}
                          active={activeSection === subItem.key}
                          onClick={() => setActiveSection(subItem.key)}
                        />
                      </div>
                    ))}
                </div>
              ))}
          </div>
        ))}
      </div>

      {/* Language switcher */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <div
          style={{
            color: "#fff",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 1,
            marginBottom: 8,
            textTransform: "uppercase",
          }}
        >
          {t.langue}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {(["FR", "EN", "AR"] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              style={{
                flex: 1,
                padding: "6px 4px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.2)",
                background: lang === l ? "#3b82f6" : "transparent",
                color: "#e2e8f0",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

interface NavItemProps {
  item: NavItemData;
  active: boolean;
  onClick: () => void;
}

function NavItem({ item, active, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "none", background: active ? (item.highlight ? "#ea580c" : "#3b82f6") : item.highlight ? "rgba(234,88,12,0.15)" : "transparent", color: active ? "#fff" : item.highlight ? "#fb923c" : "#cbd5e1", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 13, fontWeight: active ? 700 : 500, marginBottom: 2, textAlign: "left", transition: "all 0.15s" }}
    >
      <Icon name={item.icon} size={15} />
      {item.label}
    </button>
  );
}
