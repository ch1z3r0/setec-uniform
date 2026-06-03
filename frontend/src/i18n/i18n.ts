import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import km from "../locales/km.json";
import en from "../locales/en.json";

const savedLang = localStorage.getItem("setec-lang") || "km";

i18n.use(initReactI18next).init({
  resources: {
    km: { translation: km },
    en: { translation: en },
  },
  lng: savedLang,
  fallbackLng: "km",
  interpolation: { escapeValue: false },
});

i18n.on("languageChanged", (lang) => {
  localStorage.setItem("setec-lang", lang);
  document.documentElement.lang = lang;
  if (lang === "km") {
    document.documentElement.classList.add("lang-km");
    document.documentElement.classList.remove("lang-en");
  } else {
    document.documentElement.classList.add("lang-en");
    document.documentElement.classList.remove("lang-km");
  }
});

// Set initial class
document.documentElement.lang = savedLang;
document.documentElement.classList.add(`lang-${savedLang}`);

export default i18n;
