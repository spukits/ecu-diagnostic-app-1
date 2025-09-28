import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

// Απλό λεξικό i18n (πρόσθεσε κλειδιά όπου χρειάζεται)
const DICT = {
  en: {
    home: "Home",
    logout: "Logout",
    liveData: "Live Data",
    demoMode: "Demo Mode",
    connectLiveData: "Connect Live Data",
    settings: "Settings",
    saveSettings: "Save Settings",
    reset: "Reset",
    exportJson: "Export (JSON)",
    importJson: "Import (JSON)",
    language: "Language",
    appearance: "Appearance",
    notifications: "Notifications",
    privacy: "Privacy (do not record personal data)",
    defaultVehicle: "Default vehicle",
    profilePhoto: "Profile photo",
  },
  el: {
    home: "Home",
    logout: "Αποσύνδεση",
    liveData: "Live Data",
    demoMode: "Demo Mode",
    connectLiveData: "Σύνδεση Live Data",
    settings: "Ρυθμίσεις",
    saveSettings: "Αποθήκευση Ρυθμίσεων",
    reset: "Επαναφορά",
    exportJson: "Εξαγωγή (JSON)",
    importJson: "Εισαγωγή (JSON)",
    language: "Γλώσσα",
    appearance: "Εμφάνιση",
    notifications: "Ειδοποιήσεις",
    privacy: "Απόρρητο (μην καταγράφεις προσωπικά δεδομένα)",
    defaultVehicle: "Προεπιλεγμένο όχημα",
    profilePhoto: "Φωτογραφία προφίλ",
  }
};

const DEFAULTS = {
  language: "el",
  theme: "light",
  notifications: false,
  privacyMode: false,
  defaultVehicle: "",
  profilePhotoBase64: "",
};

const STORAGE_KEY = "app_settings";

const AppSettingsContext = createContext(null);

export const AppSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULTS);

  // load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSettings(prev => ({ ...prev, ...JSON.parse(raw) }));
    } catch {}
  }, []);

  // apply theme class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [settings.theme]);

  // helper i18n
  const t = (key) => (DICT[settings.language]?.[key] ?? key);

  const value = useMemo(() => ({
    settings,
    setSettings,
    t,
    setTheme: (theme) => setSettings(s => save({ ...s, theme })),
    setLanguage: (lang) => setSettings(s => save({ ...s, language: lang })),
    setProfilePhoto: (b64) => setSettings(s => save({ ...s, profilePhotoBase64: b64 })),
    save, // public save
  // eslint-disable-next-line
  }), [settings]);

  function save(next) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  }

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  );
};

export const useAppSettings = () => useContext(AppSettingsContext);
