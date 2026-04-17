import { useState } from "react";
import Icon from "../shared/Icon";
import ChatBot from "../shared/ChatBot";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import type { AuthUser } from "../../services/authApi";
import type { Theme, UserType, Lang, TranslationStrings } from "../../types";

// Pages communes
import GroupesHome     from "../../pages/etudiant/GroupesHome";
import EmploiDuTemps   from "../../pages/etudiant/EmploiDuTemps";
import MesCours        from "../../pages/etudiant/MesCours";
import MesGroupes      from "../../pages/etudiant/MesGroupes";
import Messages        from "../../pages/etudiant/Messages";
import MesAbsences     from "../../pages/etudiant/MesAbsences";
import Scolarite       from "../../pages/etudiant/Scolarite";
import EspaceAdmin     from "../../pages/etudiant/EspaceAdmin";
import CreerGroupe     from "../../pages/etudiant/CreerGroupe";
import ProfilVoir      from "../../pages/etudiant/ProfilVoir";
import ProfilEditer    from "../../pages/etudiant/ProfilEditer";

// Pages administration
import AjouterEmploi      from "../../pages/administration/AjouterEmploi";
import GestionAbsences    from "../../pages/administration/GestionAbsences";
import GestionPaiements   from "../../pages/administration/GestionPaiements";
import CreerProfil        from "../../pages/administration/CreerProfil";

// Pages prof
import GestionAbsencesProf from "../../pages/administration/GestionAbsences";

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
interface DashboardProps {
  theme: Theme;
  authUser: AuthUser | null;
  userType: UserType;
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  activeSection: string;
  setActiveSection: (section: string) => void;
  showProfileMenu: boolean;
  setShowProfileMenu: React.Dispatch<React.SetStateAction<boolean>>;
  showChatBot: boolean;
  setShowChatBot: React.Dispatch<React.SetStateAction<boolean>>;
  onLogout: () => void;
  lang: Lang;
  setLang: React.Dispatch<React.SetStateAction<Lang>>;
  t: TranslationStrings;
}

export default function Dashboard({
  theme, authUser, userType, darkMode, setDarkMode,
  activeSection, setActiveSection,
  showProfileMenu, setShowProfileMenu,
  showChatBot, setShowChatBot,
  onLogout, lang, setLang, t,
}: DashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [tuitionStatus, setTuitionStatus] = useState("payant"); // payant | boursier

  const handleNavigate = (key: string) => {
    setActiveSection(key);
    setSelectedGroup(null);
    setSelectedConversationId(null);
    setSidebarOpen(false);
  };

  const SECTIONS: Record<string, React.ReactNode> = {
    "home":              <GroupesHome
                            theme={theme}
                            userType={userType}
                            t={t}
                            onSelectGroup={(group: string) => {
                              setActiveSection("groupes");
                              setSelectedGroup(group);
                              setSelectedConversationId(null);
                            }}
                            onSelectConversation={(id: number) => {
                              setActiveSection("messages");
                              setSelectedConversationId(id);
                              setSelectedGroup(null);
                            }}
                          />,
    "emploi":            <EmploiDuTemps    theme={theme} userType={userType} t={t} />,
    "cours":             <MesCours         theme={theme} userType={userType} t={t} lang={lang} />,
    "groupes":           <MesGroupes       theme={theme} userType={userType} t={t} initialGroup={selectedGroup} />,
    "messages":          <Messages         theme={theme} t={t} initialSelectedMessageId={selectedConversationId} />,
    "absences":          <MesAbsences      theme={theme} t={t} />,
    "scolarite":         <Scolarite        theme={theme} t={t} userType={userType} tuitionStatus={tuitionStatus} onTuitionStatusChange={setTuitionStatus} />,
    "espace-admin":      <EspaceAdmin      theme={theme} t={t} userType={userType} />,
    "creer-groupe":      <CreerGroupe      theme={theme} t={t} />,
    "profil-voir":       <ProfilVoir       theme={theme} t={t} />,
    "profil-editer":     <ProfilEditer     theme={theme} t={t} />,
    "emploi-add":        <AjouterEmploi    theme={theme} t={t} />,
    "gestion-absences":  userType === "prof" ? <GestionAbsencesProf theme={theme} t={t} userType={userType} /> : <GestionAbsences theme={theme} t={t} />,
    "gestion-paiements": <GestionPaiements theme={theme} t={t} />,
    "creer-profil":      <CreerProfil      theme={theme} t={t} />,
  };

  return (
    <div className="dashboard">
      <Sidebar
        theme={theme}
        userType={userType}
        activeSection={activeSection}
        setActiveSection={handleNavigate}
        lang={lang}
        setLang={setLang}
        t={t}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {sidebarOpen && <div className="sidebarBackdrop" onClick={() => setSidebarOpen(false)} />}

      <div className="mainContent">
        <Topbar
          theme={theme}
          authUser={authUser}
          userType={userType}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          showProfileMenu={showProfileMenu}
          setShowProfileMenu={setShowProfileMenu}
          setActiveSection={handleNavigate}
          onLogout={onLogout}
          onToggleSidebar={() => setSidebarOpen((open) => !open)}
          t={t}
        />

        <main
          style={{ backgroundColor: theme.bg }}
          onClick={() => showProfileMenu && setShowProfileMenu(false)}
        >
          {SECTIONS[activeSection] ?? <GroupesHome theme={theme} userType={userType} t={t} />}
        </main>
      </div>

      {/* ChatBot FAB */}
      <button
        onClick={() => setShowChatBot(!showChatBot)}
        style={{ position: "fixed", bottom: 24, right: 24, width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,#1d4ed8,#7c3aed)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 4px 20px rgba(29,78,216,0.4)", zIndex: 200 }}
      >
        <Icon name="bot" size={24} />
      </button>

      {showChatBot && <ChatBot theme={theme} t={t} onClose={() => setShowChatBot(false)} />}
    </div>
  );
}
