import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Language = "en" | "am" | "ti";

type Dict = Record<string, string>;

const en: Dict = {
  // common
  home: "Home",
  about: "About",
  nutrition: "Nutrition",
  training: "Training",
  contact: "Contact",
  login: "Login",
  signup: "Sign Up",
  getStarted: "Get Started",
  language: "Language",
  logout: "Logout",
  save: "Save",
  saving: "Saving...",
  cancel: "Cancel",
  // dashboard
  dashboard: "Dashboard",
  myProfile: "My Profile",
  progressTracking: "Progress Tracking",
  events: "Events",
  bmiBmr: "BMI & BMR Calculator",
  aiNutrition: "AI Nutrition",
  bookCoach: "Book with Coach Dave",
  mySchedule: "My Schedule",
  messages: "Messages",
  // profile
  fullName: "Full Name",
  email: "Email",
  phone: "Phone Number",
  height: "Height",
  weight: "Weight",
  gender: "Gender",
  // admin
  adminPanel: "Admin Panel",
  registeredUsers: "Registered Users",
  bookingRequests: "Booking Requests",
  addUser: "Add User",
};

const am: Dict = {
  home: "መነሻ",
  about: "ስለ እኛ",
  nutrition: "አመጋገብ",
  training: "ልምምድ",
  contact: "አግኙን",
  login: "ግባ",
  signup: "ይመዝገቡ",
  getStarted: "ጀምር",
  language: "ቋንቋ",
  logout: "ውጣ",
  save: "አስቀምጥ",
  saving: "በማስቀመጥ ላይ...",
  cancel: "ሰርዝ",
  dashboard: "ዳሽቦርድ",
  myProfile: "የእኔ መገለጫ",
  progressTracking: "የእድገት ክትትል",
  events: "ዝግጅቶች",
  bmiBmr: "BMI እና BMR ማስሊያ",
  aiNutrition: "AI አመጋገብ",
  bookCoach: "ከአሰልጣኝ ዴቭ ጋር ይያዙ",
  mySchedule: "የእኔ መርሃ ግብር",
  messages: "መልዕክቶች",
  fullName: "ሙሉ ስም",
  email: "ኢሜይል",
  phone: "ስልክ ቁጥር",
  height: "ቁመት",
  weight: "ክብደት",
  gender: "ጾታ",
  adminPanel: "የአስተዳዳሪ ፓነል",
  registeredUsers: "የተመዘገቡ ተጠቃሚዎች",
  bookingRequests: "የቦታ ማስያዣ ጥያቄዎች",
  addUser: "ተጠቃሚ ጨምር",
};

const ti: Dict = {
  home: "መበገሲ",
  about: "ብዛዕባና",
  nutrition: "መግቢ",
  training: "ስልጠና",
  contact: "ርኸቡና",
  login: "እተው",
  signup: "ተመዝገቡ",
  getStarted: "ጀምር",
  language: "ቋንቋ",
  logout: "ውጻእ",
  save: "ኣቐምጥ",
  saving: "ይቕመጥ ኣሎ...",
  cancel: "ሰርዝ",
  dashboard: "ዳሽቦርድ",
  myProfile: "ናተይ ፕሮፋይል",
  progressTracking: "ምክትታል ምዕባለ",
  events: "ፍጻሜታት",
  bmiBmr: "BMI ከምኡ’ውን BMR",
  aiNutrition: "AI መግቢ",
  bookCoach: "ምስ ኣሰልጣኒ ዴቭ ሓዝ",
  mySchedule: "ናተይ መደብ",
  messages: "መልእኽትታት",
  fullName: "ምሉእ ስም",
  email: "ኢመይል",
  phone: "ቁጽሪ ስልኪ",
  height: "ቁመት",
  weight: "ክብደት",
  gender: "ጾታ",
  adminPanel: "ናይ ኣመሓዳሪ ፓነል",
  registeredUsers: "ዝተመዝገቡ ተጠቀምቲ",
  bookingRequests: "ናይ ምሕዛእ ጠለባት",
  addUser: "ተጠቃሚ ወስኽ",
};

const dicts: Record<Language, Dict> = { en, am, ti };

interface I18nCtx {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: keyof typeof en) => string;
}

const I18nContext = createContext<I18nCtx>({
  lang: "en",
  setLang: () => {},
  t: (k) => en[k] || (k as string),
});

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("app_lang") : null;
    return (saved as Language) || "en";
  });

  useEffect(() => {
    localStorage.setItem("app_lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Language) => setLangState(l);
  const t = (key: keyof typeof en) => dicts[lang][key] || en[key] || (key as string);

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
};

export const useI18n = () => useContext(I18nContext);

export const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: "en", label: "English" },
  { value: "am", label: "አማርኛ (Amharic)" },
  { value: "ti", label: "ትግርኛ (Tigrinya)" },
];
