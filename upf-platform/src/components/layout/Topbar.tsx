import Icon from "../shared/Icon";
import { authUserInitials, formatAuthDisplayName, type AuthUser } from "../../services/authApi";
import type { Theme, UserType, TranslationStrings } from "../../types";

interface TopbarProps {
  theme: Theme;
  authUser: AuthUser | null;
  userType: UserType;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  showProfileMenu: boolean;
  setShowProfileMenu: (v: boolean) => void;
  setActiveSection: (key: string) => void;
  onLogout: () => void;
  onToggleSidebar: () => void;
  t: TranslationStrings;
}

// ─── TOPBAR ───────────────────────────────────────────────────────────────────
export default function Topbar({ theme, authUser, userType, darkMode, setDarkMode, showProfileMenu, setShowProfileMenu, setActiveSection, onLogout, onToggleSidebar, t }: TopbarProps) {
  const roleLabel = ({
    etudiant:       t.roleEtudiant,
    prof:           t.roleProf,
    admin:          t.roleAdmin,
    administration: t.roleAdministration,
  } as Record<UserType, string>)[userType];

  const profileMenuItems = [
    {
      icon:   "eye",
      label:  t.viewProfile,
      action: () => { setActiveSection("profil-voir"); setShowProfileMenu(false); },
    },
    {
      icon:   "edit",
      label:  t.editProfile,
      action: () => { setActiveSection("profil-editer"); setShowProfileMenu(false); },
    },
    {
      icon:   darkMode ? "sun" : "moon",
      label:  darkMode ? t.lightMode : t.darkMode,
      action: () => { setDarkMode(!darkMode); setShowProfileMenu(false); },
    },
  ];

  return (
    <header className="topbar" style={{ backgroundColor: theme.surface, borderBottom: `1px solid ${theme.border}` }}>
      {/* User info */}
      <div className="userInfo">
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: authUser?.photoUrl ? "transparent" : "linear-gradient(135deg,#3b82f6,#8b5cf6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 800,
            fontSize: 14,
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {authUser?.photoUrl ? (
            <img src={authUser.photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            authUserInitials(authUser)
          )}
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 14, color: theme.text }}>{formatAuthDisplayName(authUser)}</div>
          <div style={{ fontSize: 11, color: theme.textMuted }}>{roleLabel}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="actions">
        <button
          className="hamburger"
          onClick={onToggleSidebar}
          style={{ background: "none", border: `1px solid ${theme.border}`, borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: theme.textMuted, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <Icon name="menu" size={16} />
        </button>

        {/* Dark mode */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{ background: "none", border: `1px solid ${theme.border}`, borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: theme.textMuted, display: "flex", alignItems: "center" }}
        >
          <Icon name={darkMode ? "sun" : "moon"} size={14} />
        </button>

        {/* Notifications */}
        <button style={{ background: "none", border: `1px solid ${theme.border}`, borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: theme.textMuted, position: "relative" }}>
          <Icon name="bell" size={16} />
          <span style={{ position: "absolute", top: 4, right: 4, width: 6, height: 6, borderRadius: "50%", background: "#ef4444" }} />
        </button>

        {/* Profile dropdown */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{ background: "none", border: `1px solid ${theme.border}`, borderRadius: 8, padding: "6px 12px", cursor: "pointer", color: theme.textMuted, display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600 }}
          >
            <Icon name="user" size={14} /> {t.profil}
          </button>

          {showProfileMenu && (
            <div style={{ position: "absolute", top: "100%", right: 0, marginTop: 8, backgroundColor: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 8, minWidth: 200, boxShadow: "0 8px 30px rgba(0,0,0,0.15)", zIndex: 100 }}>
              {profileMenuItems.map((item, i) => (
                <button
                  key={i}
                  onClick={item.action}
                  style={{ width: "100%", padding: "9px 12px", background: "none", border: "none", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 10, color: theme.text, fontSize: 13, fontWeight: 600 }}
                >
                  <Icon name={item.icon} size={14} /> {item.label}
                </button>
              ))}
              <div style={{ height: 1, background: theme.border, margin: "6px 0" }} />
              <button
                onClick={onLogout}
                style={{ width: "100%", padding: "9px 12px", background: "none", border: "none", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 10, color: "#ef4444", fontSize: 13, fontWeight: 600 }}
              >
                <Icon name="logout" size={14} /> {t.deconnexion}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
