import { useCallback, useState } from "react";
import { useTheme }    from "./hooks/useTheme";
import { TRANSLATIONS } from "./data/translations";
import { AccueilPage, LoginPage } from "./pages/auth/AuthPages";
import Dashboard from "./components/layout/Dashboard";
import { SessionProvider } from "./context/SessionContext";
import {
  clearAuthSession,
  getStoredAuthUser,
  getStoredToken,
  SESSION_ROLE_KEY,
  SESSION_USER_KEY,
  type AuthUser,
} from "./services/authApi";
import type { UserType, Lang } from "./types";

function readStoredUserType(): UserType | null {
  const t = localStorage.getItem(SESSION_ROLE_KEY);
  if (t === "etudiant" || t === "prof" || t === "admin" || t === "administration") return t;
  const u = getStoredAuthUser();
  if (!u) return null;
  const r = (u.role || "").toLowerCase();
  if (r.includes("administr")) return "administration";
  if (r.includes("enseignant")) return "prof";
  if (r.includes("etudiant")) return "etudiant";
  return "etudiant";
}

function initialDashboardPage(): "accueil" | "login" | "dashboard" {
  if (getStoredToken() && getStoredAuthUser()) return "dashboard";
  return "accueil";
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const { theme, darkMode, setDarkMode } = useTheme();

  const [page,            setPage]            = useState<"accueil" | "login" | "dashboard">(initialDashboardPage);
  const [userType,        setUserType]        = useState<UserType | null>(() => {
    const t = readStoredUserType();
    if (t) return t;
    return getStoredToken() && getStoredAuthUser() ? "etudiant" : null;
  });
  const [authUser,        setAuthUser]        = useState(() => getStoredAuthUser());
  const [activeSection,   setActiveSection]   = useState("home");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showChatBot,     setShowChatBot]     = useState(false);
  const [lang,            setLang]            = useState<Lang>("FR");

  const t = TRANSLATIONS[lang];

  const handleLogin = (type: UserType) => {
    setUserType(type);
    setAuthUser(getStoredAuthUser());
    setPage("dashboard");
    setActiveSection("home");
  };

  const handleLogout = () => {
    clearAuthSession();
    setAuthUser(null);
    setPage("accueil");
    setUserType(null);
    setActiveSection("home");
  };

  const patchAuthUser = useCallback((partial: Partial<AuthUser>) => {
    setAuthUser((prev) => {
      const base = prev ?? getStoredAuthUser();
      if (!base) return null;
      const next = { ...base, ...partial };
      localStorage.setItem(SESSION_USER_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  if (page === "accueil") {
    return (
      <AccueilPage
        theme={theme}
        t={t}
        onLogin={() => setPage("login")}
      />
    );
  }

  if (page === "login") {
    return (
      <LoginPage
        theme={theme}
        t={t}
        lang={lang}
        onLogin={handleLogin}
        onBack={() => setPage("accueil")}
      />
    );
  }

  return (
    <SessionProvider user={authUser} patchUser={patchAuthUser}>
      <div
        className="app"
        style={{
          backgroundColor: theme.bg,
          color: theme.text,
          transition: "all 0.3s",
          "--bg": theme.bg,
          "--text": theme.text,
          "--surface": theme.surface,
          "--border": theme.border,
          "--sidebar": theme.sidebar,
        } as React.CSSProperties}
      >
        <Dashboard
          theme={theme}
          authUser={authUser}
          userType={userType!}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          showProfileMenu={showProfileMenu}
          setShowProfileMenu={setShowProfileMenu}
          showChatBot={showChatBot}
          setShowChatBot={setShowChatBot}
          onLogout={handleLogout}
          lang={lang}
          setLang={setLang}
          t={t}
        />
      </div>
    </SessionProvider>
  );
}
