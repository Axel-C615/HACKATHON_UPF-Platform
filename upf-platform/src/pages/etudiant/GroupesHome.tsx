import Icon from "../../components/shared/Icon";
import type { Theme, UserType, TranslationStrings } from "../../types";

interface GroupesHomeProps {
  theme: Theme;
  userType: UserType;
  t: TranslationStrings;
  onSelectGroup?: (group: string) => void;
  onSelectConversation?: (id: number) => void;
}

// ─── ACCUEIL / TABLEAU DE BORD ────────────────────────────────────────────────
export default function GroupesHome({ theme, userType, t, onSelectGroup, onSelectConversation }: GroupesHomeProps) {
  const isProf           = userType === "prof";
  const isAdministration = userType === "administration";
  const showStatCards    = !isProf && !isAdministration;

  const stats = [
    { label: t.absences,           value: "2",      icon: "alert",    color: "#ef4444", bg: "#fee2e2", show: showStatCards },
    { label: t.unreadMessages,     value: "4",      icon: "message",  color: "#8b5cf6", bg: "#ede9fe", show: true          },
    { label: t.nextExam,           value: "15 Juin",icon: "calendar", color: "#059669", bg: "#d1fae5", show: true          },
  ].filter((s) => s.show);

  const notifications = [
    { group: "Mon Année — 2GI", msg: "Nouveau cours de Maths ajouté",   time: "Il y a 2h", color: "#3b82f6", type: "group" as const },
    { group: "Général",         msg: "Réunion pédagogique vendredi 10h", time: "Il y a 5h", color: "#059669", type: "group" as const },
    { group: "Administration", msg: "Vous avez un message de l'administration", time: "Hier",      color: "#3b82f6", type: "message" as const, messageId: 1 },
  ];

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 900, color: theme.text, marginBottom: 4 }}>
        {t.bienvenue} UPF
      </h2>
      <p style={{ color: theme.textMuted, marginBottom: 24, fontSize: 13 }}>
        {t.campusYear}
      </p>

      {/* Notifications */}
      <div style={{ backgroundColor: theme.surface, borderRadius: 16, padding: 20, border: `1px solid ${theme.border}`, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <Icon name="bell" size={16} />
          <span style={{ fontWeight: 800, fontSize: 15, color: theme.text }}>{t.notifs}</span>
          <span style={{ marginLeft: "auto", backgroundColor: "#ef4444", color: "#fff", borderRadius: 20, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>3</span>
        </div>
        {notifications.map((n, i) => (
          <button
            key={i}
            onClick={() => {
              if (n.type === "message" && onSelectConversation && "messageId" in n) {
                onSelectConversation(n.messageId!);
              } else if (onSelectGroup) {
                onSelectGroup(n.group);
              }
            }}
            style={{ width: "100%", display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 14px", backgroundColor: theme.bg, borderRadius: 10, marginBottom: 8, border: "none", cursor: "pointer", textAlign: "left" }}
          >
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: n.color, marginTop: 5, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: n.color }}>{n.group}</div>
              <div style={{ fontSize: 13, color: theme.text }}>{n.msg}</div>
            </div>
            <div style={{ fontSize: 11, color: theme.textMuted }}>{n.time}</div>
          </button>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ backgroundColor: theme.surface, borderRadius: 14, padding: 18, border: `1px solid ${theme.border}` }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: s.bg, display: "flex", alignItems: "center", justifyContent: "center", color: s.color, marginBottom: 12 }}>
              <Icon name={s.icon} size={18} />
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: theme.text }}>{s.value}</div>
            <div style={{ fontSize: 12, color: theme.textMuted }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
