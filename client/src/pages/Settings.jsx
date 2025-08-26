import React, { useState, useEffect, useRef } from "react";

export default function Settings() {
  // State
  const [language, setLanguage] = useState(() => localStorage.getItem("language") || "el");
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [notifications, setNotifications] = useState(() => localStorage.getItem("notifications") === "true");
  const [defaultCar, setDefaultCar] = useState(() => localStorage.getItem("defaultCar") || "");
  const [profileImg, setProfileImg] = useState(() => localStorage.getItem("profileImg") || "");
  const [privacyMode, setPrivacyMode] = useState(() => localStorage.getItem("privacyMode") === "true");
  const [showPreview, setShowPreview] = useState(false);
  const importRef = useRef();

  // Car list (dummy)
  const carList = [
    { vin: "1HGBH41JXMN109186", label: "Honda Civic" },
    { vin: "1FADP3F26DL123456", label: "Ford Focus" },
    { vin: "JTDBR32E520062849", label: "Toyota Corolla" }
  ];

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem("language", language);
    localStorage.setItem("theme", theme);
    localStorage.setItem("notifications", notifications);
    localStorage.setItem("defaultCar", defaultCar);
    localStorage.setItem("profileImg", profileImg);
    localStorage.setItem("privacyMode", privacyMode);
    document.body.className = theme === "dark" ? "dark" : "";
  }, [language, theme, notifications, defaultCar, profileImg, privacyMode]);

  // Profile image upload
  const handleImageUpload = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (event) {
      setProfileImg(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Export settings
  const handleExport = () => {
    const settings = {
      language, theme, notifications, defaultCar, profileImg, privacyMode
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(settings, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "settings.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Import settings
  const handleImport = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        const imported = JSON.parse(event.target.result);
        setLanguage(imported.language || "el");
        setTheme(imported.theme || "light");
        setNotifications(imported.notifications ?? true);
        setDefaultCar(imported.defaultCar || "");
        setProfileImg(imported.profileImg || "");
        setPrivacyMode(imported.privacyMode ?? false);
        alert("Επιτυχής εισαγωγή ρυθμίσεων!");
      } catch {
        alert("Μη έγκυρο αρχείο!");
      }
    };
    reader.readAsText(file);
  };

  // Reset
  const handleReset = () => {
    if (window.confirm("Είσαι σίγουρος ότι θέλεις να επαναφέρεις τις ρυθμίσεις;")) {
      setLanguage("el");
      setTheme("light");
      setNotifications(true);
      setDefaultCar("");
      setProfileImg("");
      setPrivacyMode(false);
      localStorage.clear();
    }
  };

  // Προεπισκόπηση ρυθμίσεων
  const preview = (
    <div className="p-4 bg-gray-100 rounded-xl mt-3 text-sm space-y-1">
      <div><b>Γλώσσα:</b> {language}</div>
      <div><b>Εμφάνιση:</b> {theme === "dark" ? "Σκούρο" : "Ανοιχτό"}</div>
      <div><b>Ειδοποιήσεις:</b> {notifications ? "Ναι" : "Όχι"}</div>
      <div><b>Προεπιλεγμένο όχημα:</b> {carList.find(c => c.vin === defaultCar)?.label || "—"}</div>
      <div><b>Απόρρητο:</b> {privacyMode ? "Ενεργό" : "Ανενεργό"}</div>
      {profileImg && <img src={profileImg} alt="avatar" className="w-16 h-16 mt-2 rounded-full border" />}
    </div>
  );

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow space-y-8">
      <h1 className="text-2xl font-bold text-center">⚙️ Ρυθμίσεις</h1>

      {/* Profile image */}
      <div className="flex items-center gap-4">
        <div>
          <label className="block font-semibold mb-1">Φωτογραφία προφίλ</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
        </div>
        {profileImg && <img src={profileImg} alt="avatar" className="w-16 h-16 rounded-full border" />}
      </div>

      {/* Γλώσσα */}
      <div className="flex items-center justify-between">
        <label htmlFor="lang" className="font-semibold">Γλώσσα</label>
        <select
          id="lang"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="el">Ελληνικά</option>
          <option value="en">English</option>
        </select>
      </div>

      {/* Theme */}
      <div className="flex items-center justify-between">
        <label className="font-semibold">Εμφάνιση</label>
        <div className="flex gap-2">
          <button
            onClick={() => setTheme("light")}
            className={`p-2 rounded ${theme === "light" ? "bg-blue-500 text-white" : "bg-gray-100"}`}
          >
            Light
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`p-2 rounded ${theme === "dark" ? "bg-blue-500 text-white" : "bg-gray-100"}`}
          >
            Dark
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="flex items-center justify-between">
        <label className="font-semibold">Ειδοποιήσεις</label>
        <input
          type="checkbox"
          checked={notifications}
          onChange={() => setNotifications(!notifications)}
          className="h-5 w-5 accent-blue-500"
        />
      </div>

      {/* Privacy mode */}
      <div className="flex items-center justify-between">
        <label className="font-semibold">Απόρρητο (Μην καταγράφεις προσωπικά δεδομένα)</label>
        <input
          type="checkbox"
          checked={privacyMode}
          onChange={() => setPrivacyMode(!privacyMode)}
          className="h-5 w-5 accent-blue-500"
        />
      </div>

      {/* Default Car */}
      <div className="flex items-center justify-between">
        <label htmlFor="default-car" className="font-semibold">Προεπιλεγμένο όχημα</label>
        <select
          id="default-car"
          value={defaultCar}
          onChange={(e) => setDefaultCar(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">-- Καμία επιλογή --</option>
          {carList.map(car => (
            <option key={car.vin} value={car.vin}>{car.label}</option>
          ))}
        </select>
      </div>

      {/* Export/Import Settings */}
      <div className="flex gap-3 pt-4 border-t">
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          onClick={handleExport}
        >
          Εξαγωγή Ρυθμίσεων
        </button>
        <input
          type="file"
          ref={importRef}
          style={{ display: 'none' }}
          accept="application/json"
          onChange={handleImport}
        />
        <button
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          onClick={() => importRef.current && importRef.current.click()}
        >
          Εισαγωγή Ρυθμίσεων
        </button>
      </div>

      {/* Προεπισκόπηση */}
      <div className="flex justify-end">
        <button
          className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded text-sm"
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? "Απόκρυψη προεπισκόπησης" : "Δες προεπισκόπηση ρυθμίσεων"}
        </button>
      </div>
      {showPreview && preview}

      {/* Reset */}
      <div className="pt-4 border-t flex justify-end">
        <button
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          onClick={handleReset}
        >
          Επαναφορά/Διαγραφή Όλων
        </button>
      </div>
    </div>
  );
}


  