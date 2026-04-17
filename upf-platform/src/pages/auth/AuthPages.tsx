import { useState, useEffect } from "react";
import type { Theme, TranslationStrings, UserType } from "../../types";
import { loginRequestAuto, saveAuthSession, SESSION_ROLE_KEY } from "../../services/authApi";

/** Pied de page accueil : campus Rabat — ISSI, coordonnées alignées sur upf.ac.ma */
/** Fond page connexion — remplacer `public/images/login-bg.png` par votre visuel */
const LOGIN_PAGE_BG_URL = "/images/login-bg.png";

const UPF_OFFICIAL_URL = "https://www.upf.ac.ma/";
const APP_MOBILE_DRIVE_URL =
  "https://drive.google.com/drive/folders/14VieEDF6qMTbYnVqO8I3-3uDQ1DMywl9?usp=sharing";
const UPF_TEL_HREF = "tel:+212535610320";
const UPF_TEL_DISPLAY = "+212 535 610 320";
const UPF_MAIL = "info@upf.ac.ma";

const ACCUEIL_FOOTER_ETABLISSEMENTS: readonly string[] = [
  "Campus Rabat — Institut Supérieur des Sciences de l'Ingénieur",
  "Faculté des Sciences de l'Ingénieur",
  "Faculté de Médecine Dentaire",
  "Faculté des Sciences Paramédicales et Techniques de Santé",
  "École Supérieure des Métiers de l'Architecture et du Bâtiment",
  "Fès Business School",
  "Sciences Po — Institut Supérieur des Sciences Politiques et Juridiques",
  "Centre des Études Doctorales",
  "Centre de Recherche, Développement, Expertise et Innovation",
  "Centre de Formation Continue Executive Education",
  "Centre de Langues, Culture et Soft Skills",
];

interface AccueilPageProps {
  theme: Theme;
  onLogin: () => void;
  t: TranslationStrings;
}

// ─── PAGE ACCUEIL ─────────────────────────────────────────────────────────────
export function AccueilPage({ theme, onLogin, t }: AccueilPageProps) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [footerEtablissementsOpen, setFooterEtablissementsOpen] = useState(false);

  const heroImages = [
    { src: "/images/hero-1.png", alt: "Conférence et innovation à l'UPF", title: "Innovation & savoir-faire" },
    { src: "/images/hero-2.png", alt: "Communauté étudiante UPF", title: "Vie étudiante" },
    { src: "/images/hero-3.png", alt: "Campus, laboratoires et apprentissage UPF", title: "Excellence académique" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  const nextSlide = () => {
    setSlideIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
  };

  const prevSlide = () => {
    setSlideIndex((prevIndex) => (prevIndex - 1 + heroImages.length) % heroImages.length);
  };

  const goToSlide = (index: number) => {
    setSlideIndex(index);
  };

  return (
    <div className="authPageRoot" style={{ backgroundColor: theme.bg }}>
      <nav
        style={{
          backgroundColor: "#eef2f8",
          borderBottom: "1px solid #dbe4f0",
          padding: "0 clamp(14px, 4vw, 32px)",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          boxShadow: "0 2px 10px rgba(30, 58, 138, 0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", minWidth: 0, flexShrink: 1 }}>
          <img
            src="/logo-upf.png"
            alt="UPF"
            decoding="async"
            style={{
              display: "block",
              height: "clamp(28px, 8vw, 44px)",
              width: "auto",
              maxWidth: "min(72vw, 300px)",
              objectFit: "contain",
              objectPosition: "left center",
            }}
          />
        </div>
        <button type="button" onClick={onLogin} className="accueil-nav-signIn">
          {t.signIn}
        </button>
      </nav>

      <div style={{ position: "relative", height: 380, overflow: "hidden" }}>
        {heroImages.map((image, index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${image.src})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              opacity: index === slideIndex ? 1 : 0,
              transition: "opacity 0.5s ease-in-out",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(135deg, rgba(29,78,216,0.12), rgba(124,58,237,0.12))",
              pointerEvents: "none",
            }} />
            <div style={{
              position: "absolute",
              bottom: 64,
              left: 32,
              right: 32,
              color: "#fff",
              textShadow: "0 10px 20px rgba(0,0,0,0.25)",
              textAlign: "left",
              zIndex: 1,
              maxWidth: 560,
            }}>
              <div style={{ fontSize: 34, fontWeight: 900, marginBottom: 10, textShadow: "0 20px 40px rgba(0,0,0,0.35)" }}>
                {image.title}
              </div>
              <div style={{ fontSize: 15, lineHeight: 1.6, color: "rgba(255,255,255,0.92)", textShadow: "0 15px 34px rgba(0,0,0,0.28)" }}>
                Découvrez l'univers UPF, ses espaces modernes et la vie étudiante dynamique.
              </div>
            </div>
            <div style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1,
            }}>
              <button type="button" onClick={onLogin} className="accueil-hero-accessSpace">
                {t.accessSpace}
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={prevSlide}
          style={{
            position: "absolute",
            left: 24,
            top: "50%",
            transform: "translateY(-50%)",
            background: "rgba(255,255,255,0.2)",
            backdropFilter: "blur(8px)",
            border: "none",
            borderRadius: "50%",
            width: 48,
            height: 48,
            color: "#fff",
            fontSize: 20,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.3s"
          }}
        >
          ‹
        </button>
        <button
          onClick={nextSlide}
          style={{
            position: "absolute",
            right: 24,
            top: "50%",
            transform: "translateY(-50%)",
            background: "rgba(255,255,255,0.2)",
            backdropFilter: "blur(8px)",
            border: "none",
            borderRadius: "50%",
            width: 48,
            height: 48,
            color: "#fff",
            fontSize: 20,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.3s"
          }}
        >
          ›
        </button>

        <div style={{
          position: "absolute",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 8
        }}>
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              style={{
                width: index === slideIndex ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: index === slideIndex ? "#fff" : "rgba(255,255,255,0.5)",
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s"
              }}
            />
          ))}
        </div>
      </div>

      <section
        aria-label={t.appCtaAriaLabel}
        style={{
          width: "100%",
          borderTop: "1px solid rgba(30, 58, 138, 0.12)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "stretch",
            maxWidth: "100%",
          }}
        >
          <div
            style={{
              flex: "1 1 min(100%, 380px)",
              minHeight: 220,
              maxHeight: 360,
              background: "#e8ecf2",
            }}
          >
            <img
              src="/images/accueil-app-cta.png"
              alt=""
              decoding="async"
              style={{
                width: "100%",
                height: "100%",
                minHeight: 220,
                maxHeight: 360,
                objectFit: "cover",
                objectPosition: "center",
                display: "block",
              }}
            />
          </div>
          <a
            href={APP_MOBILE_DRIVE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="accueil-app-cta-link"
            style={{
              flex: "1 1 min(100%, 420px)",
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 24,
              padding: "clamp(28px, 5vw, 52px) clamp(24px, 5vw, 56px)",
              textDecoration: "none",
              color: "#f8fafc",
              background: "linear-gradient(125deg, #c026d3 0%, #7c3aed 42%, #1e3a8a 88%, #0f172a 100%)",
              boxSizing: "border-box",
              minHeight: 220,
            }}
          >
            <div style={{ flex: "1 1 220px", minWidth: 0 }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: "clamp(1.15rem, 2.5vw, 1.65rem)",
                  fontWeight: 800,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  lineHeight: 1.25,
                  textShadow: "0 2px 16px rgba(0,0,0,0.2)",
                }}
              >
                {t.appCtaTitle}
              </h2>
              <div
                style={{
                  width: 120,
                  maxWidth: "100%",
                  height: 2,
                  marginTop: 14,
                  background: "rgba(248,250,252,0.95)",
                  borderRadius: 1,
                }}
              />
              <p
                style={{
                  margin: "16px 0 0",
                  fontSize: 15,
                  lineHeight: 1.55,
                  color: "rgba(248,250,252,0.92)",
                  fontWeight: 500,
                }}
              >
                {t.appCtaStoresHint}
              </p>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 12,
                  marginTop: 20,
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 14px",
                    borderRadius: 10,
                    background: "rgba(15, 23, 42, 0.45)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: "0.02em",
                  }}
                >
                  <svg width={22} height={22} viewBox="0 0 24 24" aria-hidden style={{ flexShrink: 0 }}>
                    <path
                      fill="#fff"
                      d="M3 20.5v-17l18 8.5-18 8.5zm2.5-13.4v10.8L17.2 12 5.5 7.1z"
                    />
                  </svg>
                  {t.appCtaGooglePlay}
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 14px",
                    borderRadius: 10,
                    background: "rgba(15, 23, 42, 0.45)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: "0.02em",
                  }}
                >
                  <svg width={20} height={24} viewBox="0 0 24 24" aria-hidden style={{ flexShrink: 0 }}>
                    <path
                      fill="#fff"
                      d="M16.36 12.53c-.02-2.4 1.96-3.55 2.05-3.61-1.12-1.63-2.86-1.85-3.48-1.87-1.48-.15-2.89.87-3.64.87-.75 0-1.9-.85-3.12-.83-1.6.03-3.08.93-3.9 2.37-1.66 2.88-.42 7.13 1.19 9.45.79 1.14 1.73 2.42 2.96 2.38 1.19-.05 1.63-.77 3.07-.77 1.44 0 1.84.77 3.1.75 1.28-.02 2.09-1.16 2.88-2.3.91-1.33 1.28-2.63 1.3-2.69-.03-.01-2.5-.96-2.52-3.8zM14.54 4.2c.65-.79 1.09-1.88 1.03-2.97-1 .04-2.21.67-2.93 1.51-.6.69-1.13 1.8-.99 2.86 1.05.08 2.12-.53 2.89-1.4z"
                    />
                  </svg>
                  {t.appCtaAppStore}
                </span>
              </div>
            </div>
            <div
              aria-hidden
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "linear-gradient(145deg, #fbbf24, #f59e0b)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
              }}
            >
              <svg width={28} height={28} viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M12 4v12m0 0l-4-4m4 4l4-4"
                  stroke="#fff"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M6 20h12" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" />
              </svg>
            </div>
          </a>
        </div>
      </section>

      <footer
        role="contentinfo"
        style={{
          marginTop: "auto",
          background: "linear-gradient(180deg, #1e3a8a 0%, #0f172a 100%)",
          color: "#f8fafc",
          borderTop: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "40px clamp(16px, 4vw, 28px) 28px" }}>
          <p
            style={{
              margin: 0,
              fontSize: 15,
              lineHeight: 1.65,
              color: "rgba(248,250,252,0.92)",
              maxWidth: 720,
            }}
          >
            {t.footerIntro}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 36,
              marginTop: 36,
            }}
          >
            <div>
              <h3 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "#93c5fd" }}>
                {t.footerContactTitle}
              </h3>
              <address style={{ fontStyle: "normal", fontSize: 14, lineHeight: 1.6, color: "rgba(248,250,252,0.88)" }}>
                {t.footerAddress.split("\n").map((line, i) => (
                  <span key={i} style={{ display: "block" }}>
                    {line}
                  </span>
                ))}
              </address>
              <a href={UPF_TEL_HREF} style={{ display: "inline-block", marginTop: 12, color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
                {UPF_TEL_DISPLAY}
              </a>
              <br />
              <a href={`mailto:${UPF_MAIL}`} style={{ display: "inline-block", marginTop: 6, color: "#93c5fd", fontSize: 14, textDecoration: "underline", textUnderlineOffset: 3 }}>
                {UPF_MAIL}
              </a>
            </div>

            <div>
              <h3 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "#93c5fd" }}>
                <button
                  type="button"
                  aria-expanded={footerEtablissementsOpen}
                  id="footer-etablissements-toggle"
                  onClick={() => setFooterEtablissementsOpen((open) => !open)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    margin: 0,
                    padding: 0,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "inherit",
                    font: "inherit",
                    fontWeight: 800,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    textAlign: "left",
                  }}
                >
                  <span aria-hidden style={{ fontSize: 10, opacity: 0.85, lineHeight: 1 }}>
                    {footerEtablissementsOpen ? "▼" : "▶"}
                  </span>
                  {t.footerEstablishmentsTitle}
                </button>
              </h3>
              {footerEtablissementsOpen ? (
                <ul
                  id="footer-etablissements-list"
                  aria-labelledby="footer-etablissements-toggle"
                  style={{ margin: 0, padding: 0, listStyle: "none" }}
                >
                  {ACCUEIL_FOOTER_ETABLISSEMENTS.map((label) => (
                    <li key={label} style={{ marginBottom: 10 }}>
                      <a
                        href={UPF_OFFICIAL_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "rgba(248,250,252,0.9)",
                          fontSize: 13,
                          lineHeight: 1.45,
                          textDecoration: "none",
                          borderBottom: "1px solid transparent",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderBottomColor = "rgba(147,197,253,0.7)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderBottomColor = "transparent";
                        }}
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div>
              <h3 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "#93c5fd" }}>
                {t.footerFollowUs}
              </h3>
              <p style={{ margin: "0 0 12px", fontSize: 13, lineHeight: 1.55, color: "rgba(248,250,252,0.75)" }}>
                {t.footerQuestionsHint}
              </p>
              <a
                href={UPF_OFFICIAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 16px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.12)",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 700,
                  textDecoration: "none",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                {t.footerOfficialWebsite}
              </a>
            </div>
          </div>

          <div
            style={{
              marginTop: 36,
              paddingTop: 20,
              borderTop: "1px solid rgba(255,255,255,0.12)",
              textAlign: "center",
              fontSize: 12,
              color: "rgba(248,250,252,0.65)",
            }}
          >
            © {new Date().getFullYear()} — {t.schoolName}
          </div>
        </div>
      </footer>
    </div>
  );
}

interface LoginPageProps {
  theme: Theme;
  onLogin: (type: UserType) => void;
  onBack: () => void;
  t: TranslationStrings;
  lang?: string;
}

// ─── PAGE LOGIN ───────────────────────────────────────────────────────────────
export function LoginPage({ theme, onLogin, onBack, t }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        overflow: "hidden",
        fontFamily: "'Nunito','Segoe UI',sans-serif",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#0f172a",
          backgroundImage: `linear-gradient(135deg, rgba(30, 58, 138, 0.78), rgba(29, 78, 216, 0.72), rgba(8, 145, 178, 0.68)), url(${LOGIN_PAGE_BG_URL})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className="authCard" style={{ position: "relative", zIndex: 1 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 13, marginBottom: 16 }}>{t.back}</button>

        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <img
            src="/images/upf-mark.png"
            alt="UPF"
            width={120}
            height={120}
            decoding="async"
            style={{ width: 120, height: 120, borderRadius: 24, objectFit: "contain", display: "block", margin: "0 auto 12px" }}
          />
          <h2 style={{ fontSize: 22, fontWeight: 900, color: "#1e293b", margin: 0 }}>{t.login}</h2>
        </div>

        {/* Email */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>{t.emailOrId}</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.emailPlaceholder} style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "2px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box" }} disabled={loading} />
        </div>

        {/* Password */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>{t.password}</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder={t.passwordPlaceholder} style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "2px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box" }} disabled={loading} />
        </div>

        {formError && (
          <div style={{ marginBottom: 16, padding: "10px 12px", borderRadius: 10, background: "#fef2f2", color: "#b91c1c", fontSize: 13, lineHeight: 1.45 }}>
            {formError}
          </div>
        )}

        <button
          onClick={async () => {
            setFormError(null);
            if (!email.trim() || !password) {
              setFormError(t.fillLoginFields);
              return;
            }
            setLoading(true);
            try {
              const { response, userType } = await loginRequestAuto(email, password);
              saveAuthSession(response);
              localStorage.setItem(SESSION_ROLE_KEY, userType);
              onLogin(userType);
            } catch {
              setFormError(t.loginFailed);
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading || !email.trim() || !password}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: 12,
            background: !loading && email.trim() && password ? "linear-gradient(135deg,#1d4ed8,#0891b2)" : "#cbd5e1",
            color: "#fff",
            border: "none",
            fontSize: 15,
            fontWeight: 800,
            cursor: !loading && email.trim() && password ? "pointer" : "default",
          }}
        >
          {loading ? t.connecting : t.signIn}
        </button>
      </div>
    </div>
  );
}
