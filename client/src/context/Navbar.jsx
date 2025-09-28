import React from "react";
import { useAppSettings } from "../context/AppSettingsContext";

const Navbar = ({ onLogout, onHome }) => {
  const { settings, t } = useAppSettings();

  return (
    <header className="w-full border-b bg-white dark:bg-gray-900 dark:text-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="font-semibold cursor-pointer" onClick={onHome}>
          ECU Diagnostic App
        </div>

        <div className="flex items-center gap-3">
          {/* Φωτογραφία προφίλ αντί για εικονίδιο */}
          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border">
            {settings.profilePhotoBase64 ? (
              <img
                src={settings.profilePhotoBase64}
                alt="profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full grid place-items-center text-xs text-gray-500">
                🙂
              </div>
            )}
          </div>

          <span className="hidden sm:inline">{/* π.χ. username */}</span>

          <button
            onClick={onHome}
            className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            {t("home")}
          </button>

          <button
            onClick={onLogout}
            className="px-3 py-1 rounded bg-red-600 text-white"
          >
            {t("logout")}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
