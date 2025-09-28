import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Φόρτωσε τα JSONs
import el from "./locales/el/translation.json";
import en from "./locales/en/translation.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      el: { translation: el },
      en: { translation: en }
    },
    // Κλείδωσε γλώσσα εδώ (βάλε "en" αν θες Αγγλικά)
    lng: "el",
    fallbackLng: "el",
    interpolation: { escapeValue: false }
  });

export default i18n;
