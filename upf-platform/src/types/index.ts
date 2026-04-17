// ─── TYPES PARTAGÉS — Compatible avec des modèles C# ─────────────────────────

// ─── Theme ────────────────────────────────────────────────────────────────────
export interface Theme {
  bg: string;
  surface: string;
  surface2: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryLight: string;
  accent: string;
  accentLight: string;
  orange: string;
  orangeLight: string;
  sidebar: string;
}

// ─── User / Auth ──────────────────────────────────────────────────────────────
export type UserType = "etudiant" | "prof" | "admin" | "administration";
export type Lang = "FR" | "EN" | "AR";

// ─── Data Models ──────────────────────────────────────────────────────────────
export interface Etudiant {
  id: string;
  nom: string;
  annee: string;
  email: string;
  statut: string;
  paiement: string;
  paye: number;
  total: number;
}

export interface CoursItem {
  id?: number;
  titre?: string;
  name?: string;
  type: string;
  fichier?: string;
  date: string;
  size: string;
}

export interface MatiereGroup {
  matiere: string;
  cours: CoursItem[];
}

export interface CoursData {
  [semestre: string]: MatiereGroup[];
}

export interface EmploiCours {
  jour: number;
  debut: number;
  duree: number;
  matiere: string;
  salle: string;
  prof: string;
}

export interface Emploi {
  jours: string[];
  heures: string[];
  cours: EmploiCours[];
}

export interface Seance {
  date: string;
  present: boolean;
}

export interface SeanceAdmin {
  date: string;
  presences: Record<string, boolean>;
}

export interface AbsenceRow {
  matiere: string;
  seances: Seance[];
}

export interface AbsenceDataRow {
  matiere: string;
  annee: string;
  seances: SeanceAdmin[];
}

export interface AbsencesAdmin {
  [etudiantId: string]: Array<{
    matiere: string;
    seances: Seance[];
  }>;
}

export interface MessageData {
  id: number;
  from: string;
  avatar: string;
  content: string;
  time: string;
  date: string;
  unread: boolean;
}

// ─── Conversations (Messages page) ───────────────────────────────────────────
export interface ConversationMessage {
  id: number;
  from: string;
  avatar: string;
  content: string;
  time: string;
  date: string;
  type: "text" | "file" | "voice";
  fileName?: string;
  fileType?: string;
  fileUrl?: string;
  voiceUrl?: string;
}

export interface Conversation {
  id: number;
  name: string;
  avatar: string;
  unread: boolean;
  messages: ConversationMessage[];
}

// ─── Chat (MesGroupes) ───────────────────────────────────────────────────────
export interface ChatMessage {
  from: string;
  text: string;
  mine: boolean;
  time: string;
  type: "text" | "file" | "voice";
  fileName?: string;
  fileType?: string;
  fileUrl?: string;
  voiceUrl?: string;
}

// ─── Translations ─────────────────────────────────────────────────────────────
export interface TranslationStrings {
  accueil: string;
  elearning: string;
  emploi: string;
  cours: string;
  groupes: string;
  messages: string;
  chat: string;
  myMessages: string;
  absences: string;
  scolarite: string;
  profil: string;
  langue: string;
  days: string[];
  deconnexion: string;
  bienvenue: string;
  notifs: string;
  login: string;
  signIn: string;
  back: string;
  chooseProfile: string;
  selectProfile: string;
  signInAs: string;
  emailOrId: string;
  password: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  loginFailed: string;
  connecting: string;
  fillLoginFields: string;
  campus: string;
  schoolName: string;
  infoTitle: string;
  infoSubtitle: string;
  infoCard1Title: string;
  infoCard1Desc: string;
  infoCard2Title: string;
  infoCard2Desc: string;
  infoCard3Title: string;
  infoCard3Desc: string;
  infoCard4Title: string;
  infoCard4Desc: string;
  /** Pied de page page d'accueil (inspiré upf.ac.ma) */
  footerIntro: string;
  footerContactTitle: string;
  footerAddress: string;
  footerEstablishmentsTitle: string;
  footerFollowUs: string;
  footerOfficialWebsite: string;
  footerQuestionsHint: string;
  /** Bandeau app mobile (accueil), avant le footer */
  appCtaAriaLabel: string;
  appCtaTitle: string;
  appCtaStoresHint: string;
  appCtaGooglePlay: string;
  appCtaAppStore: string;
  accessSpace: string;
  heroSlide1Title: string;
  heroSlide1Sub: string;
  heroSlide2Title: string;
  heroSlide2Sub: string;
  heroSlide3Title: string;
  heroSlide3Sub: string;
  roleEtudiant: string;
  roleProf: string;
  roleAdmin: string;
  roleAdministration: string;
  viewProfile: string;
  editProfile: string;
  lightMode: string;
  darkMode: string;
  navigation: string;
  espaceEtudiantAdmin: string;
  /** Libellé menu / page administration — file des requêtes étudiants */
  espaceRequetesEtudiant: string;
  adminRequestsTitle: string;
  adminRequestsSubtitle: string;
  adminRequestsEmpty: string;
  adminRequestsColDate: string;
  adminRequestsColStudent: string;
  adminRequestsColEmail: string;
  adminRequestsColSubject: string;
  adminRequestsColMessage: string;
  adminRequestsLocalHint: string;
  createGroup: string;
  addSchedule: string;
  manageAbsences: string;
  managePayments: string;
  createProfile: string;
  campusYear: string;
  upcomingCourses: string;
  unreadMessages: string;
  nextExam: string;
  myCourses: string;
  addFile: string;
  semester1: string;
  semester2: string;
  all: string;
  backToSubjects: string;
  download: string;
  timetable: string;
  viewAllTimetables: string;
  secondYear: string;
  /** Administration — sélecteur d’année pour l’emploi du temps */
  adminTimetableSelectLabel: string;
  adminTimetableHint: string;
  adminTimetableNoLevels: string;
  adminTimetableNoCoursesForLevel: string;
  adminTimetableLoadingLevels: string;
  hour: string;
  myGroups: string;
  createGroupLabel: string;
  messagePlaceholder: string;
  recording: string;
  send: string;
  search: string;
  reply: string;
  selectMessage: string;
  fileUploaded: string;
  voiceNote: string;
  attendanceTitle: string;
  attendanceSubtitle: string;
  subject: string;
  totalAbs: string;
  present: string;
  absent: string;
  abs: string;
  tuition: string;
  paymentTracking: string;
  setTuitionStatus: string;
  paidStatus: string;
  totalAmount: string;
  paid: string;
  remaining: string;
  paymentProgress: string;
  scholarStatus: string;
  scholarDesc: string;
  chatbotHello: string;
  chatbotStatus: string;
  chatbotPlaceholder: string;
  chatbotAbsence: string;
  chatbotCours: string;
  chatbotPaiement: string;
  chatbotEmploi: string;
  chatbotProfil: string;
  chatbotGroupes: string;
  chatbotMessages: string;
  chatbotAdmin: string;
  chatbotAuth: string;
  chatbotPlatform: string;
  chatbotUnknown: string;
  chatbotDefault: string;
  requestSent: string;
  requestResponse: string;
  newRequest: string;
  studentAdminSpace: string;
  sendRequest: string;
  sendRequestDescription: string;
  requestSubject: string;
  selectSubject: string;
  message: string;
  describeRequest: string;
  createGroupTitle: string;
  groupName: string;
  typeLabel: string;
  createAnotherGroup: string;
  groupCreated: string;
  myProfile: string;
  personalInfo: string;
  academicStats: string;
  average: string;
  rank: string;
  updateSuccess: string;
  changePhoto: string;
  saveChanges: string;
  managePaymentsTitle: string;
  paymentStatus: string;
  modify: string;
}

export type Translations = Record<Lang, TranslationStrings>;

// ─── Component Props ──────────────────────────────────────────────────────────
export interface ThemeProps {
  theme: Theme;
}

export interface ThemeTranslationProps extends ThemeProps {
  t: TranslationStrings;
}

export interface PageProps extends ThemeTranslationProps {
  userType?: UserType;
}

// ─── Constants ────────────────────────────────────────────────────────────────
export type ColorsMatieres = Record<string, string>;
export type TypeColors = Record<string, string>;
export type TypeIcons = Record<string, string>;
