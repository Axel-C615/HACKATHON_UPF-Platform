import { useState } from "react";
import Icon from "./Icon";
import type { Theme, TranslationStrings } from "../../types";

interface ChatBotProps {
  theme: Theme;
  t: TranslationStrings;
  onClose: () => void;
}

interface BotMessage {
  bot: boolean;
  text: string;
}

// ─── CHATBOT ──────────────────────────────────────────────────────────────────
export default function ChatBot({ theme, t, onClose }: ChatBotProps) {
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<BotMessage[]>([
    { bot: true, text: t?.chatbotHello ?? "Bonjour! Je suis votre assistant UPF. Comment puis-je vous aider?" },
  ]);

  const RESPONSES = [
    { keywords: ["absence"], text: t?.chatbotAbsence ?? "Consultez 'Mes absences' dans le menu." },
    { keywords: ["cours"], text: t?.chatbotCours ?? "Accédez à vos cours via 'Mes cours'." },
    { keywords: ["paiement", "scolarité", "bourse"], text: t?.chatbotPaiement ?? "Votre situation financière est dans 'Scolarité'." },
    { keywords: ["emploi", "emploi du temps"], text: t?.chatbotEmploi ?? "Votre emploi du temps est dans l'Espace learning." },
    { keywords: ["profil"], text: t?.chatbotProfil ?? "Modifiez votre profil via le menu 'Mon profil' en haut." },
    { keywords: ["groupe", "groupes"], text: t?.chatbotGroupes ?? "Visitez 'Mes groupes' pour voir vos discussions de groupe." },
    { keywords: ["message", "chat"], text: t?.chatbotMessages ?? "Allez dans 'Messages' pour les conversations 1:1 et de groupe." },
    { keywords: ["admin", "administration"], text: t?.chatbotAdmin ?? "Les actions administratives sont dans 'Administration' pour les rôles autorisés." },
    { keywords: ["inscription", "compte", "connexion", "mot de passe"], text: t?.chatbotAuth ?? "Utilisez la page Auth pour vous connecter et gérer votre compte." },
    { keywords: ["plateforme", "fonctionnalit", "utilisation", "help", "aide"], text: t?.chatbotPlatform ?? "UPF est une plateforme pour gérer cours, absences, notes et communication. Consultez les menus principaux." },
  ];

  const getReply = (query: string): string => {
    const normalized = query.toLowerCase();
    const match = RESPONSES.find((r) => r.keywords.some((keyword) => normalized.includes(keyword)));
    if (match) return match.text;

    if (/\?|\bcomment\b|\boù\b|\bque\b|\bqui\b|\bwhat\b|\bwhen\b|\bwhere\b|\bwhy\b/i.test(query)) {
      return t?.chatbotUnknown ?? "Je ne dispose pas de cette information dans l'application. Veuillez contacter le support UPF pour les détails précis.";
    }

    return t?.chatbotDefault ?? "Je peux vous aider avec vos cours, absences, emploi du temps, paiements, profils, et messages. Que souhaitez-vous savoir ?";
  };

  const send = () => {
    if (!input.trim()) return;
    const q = input;
    setInput("");
    setMsgs((m) => [...m, { bot: false, text: q }]);
    setTimeout(() => {
      const reply = getReply(q);
      setMsgs((m) => [...m, { bot: true, text: reply }]);
    }, 600);
  };

  return (
    <div style={{ position: "fixed", bottom: 90, right: 24, width: 340, height: 440, backgroundColor: theme.surface, borderRadius: 20, border: `1px solid ${theme.border}`, boxShadow: "0 16px 50px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", overflow: "hidden", zIndex: 200 }}>
      {/* Header */}
      <div style={{ padding: "14px 18px", background: "linear-gradient(135deg,#1d4ed8,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="bot" size={18} />
          </div>
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>Assistant UPF</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>● En ligne</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: 18 }}>✕</button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.bot ? "flex-start" : "flex-end" }}>
            <div style={{ maxWidth: "80%", backgroundColor: m.bot ? theme.bg : "#1d4ed8", borderRadius: 12, padding: "10px 14px", fontSize: 13, color: m.bot ? theme.text : "#fff", lineHeight: 1.5 }}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: 12, borderTop: `1px solid ${theme.border}`, display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={t?.chatbotPlaceholder ?? "Posez votre question..."}
          style={{ flex: 1, padding: "9px 12px", borderRadius: 10, border: `1px solid ${theme.border}`, backgroundColor: theme.bg, color: theme.text, fontSize: 13, outline: "none" }}
        />
        <button onClick={send} style={{ padding: "9px 14px", borderRadius: 10, background: "#1d4ed8", border: "none", color: "#fff", cursor: "pointer" }}>
          <Icon name="send" size={14} />
        </button>
      </div>
    </div>
  );
}
