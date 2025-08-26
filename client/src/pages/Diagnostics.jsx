import React, { useEffect, useState } from "react";
import dtcCodes from "../pages/dtcCodes.json"; // Εδώ κάνεις import το json με όλους τους DTC και τις περιγραφές τους

export default function Diagnostics() {
  const [vinList, setVinList] = useState([]);
  const [selectedVin, setSelectedVin] = useState("");
  const [dtcHistory, setDtcHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Βοηθητική συνάρτηση για να βάζεις σωστά το token στο request
  const getHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": "Bearer " + localStorage.getItem("token"),
  });

  // Φέρε όλα τα VIN από τις καταγραφές του χρήστη, μόνο την πρώτη φορά
  useEffect(() => {
    fetch("/api/car-diagnostics/history", { headers: getHeaders() })
      .then(res => res.json())
      .then(data => {
        // Εξάγουμε όλα τα μοναδικά VIN που υπάρχουν στις καταγραφές
        const vins = Array.from(new Set(data.map(entry => entry.vin)));
        setVinList(vins);
      });
    // eslint-disable-next-line
  }, []);

  // Όταν αλλάζεις VIN, φέρε το ιστορικό DTC αυτού του οχήματος
  useEffect(() => {
    if (!selectedVin) return;
    setLoading(true);
    fetch(`/api/car-diagnostics/history?carId=${selectedVin}`, { headers: getHeaders() })
      .then(res => res.json())
      .then(data => {
        // Φιλτράρουμε μόνο όσα έχουν ενεργά σφάλματα ή αναμμένο MIL
        const filtered = data
          .filter(
            entry =>
              entry.milStatus === true ||
              (Array.isArray(entry.dtcs) && entry.dtcs.length > 0)
          )
          .reverse();
        setDtcHistory(filtered);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    // eslint-disable-next-line
  }, [selectedVin]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Τίτλος σελίδας */}
      <h1 className="text-3xl font-bold text-center text-gray-800">
        <span role="img" aria-label="diagnostics">🛠️</span> Διαγνωστικά Οχήματος (Ιστορικό Προβλημάτων)
      </h1>

      {/* Επιλογή VIN από drop-down */}
      <div className="space-y-4 text-center">
        <select
          value={selectedVin}
          onChange={e => setSelectedVin(e.target.value)}
          className="p-2 border rounded w-full max-w-xs"
        >
          <option value="">-- Επιλέξτε VIN --</option>
          {vinList.map(vin => (
            <option key={vin} value={vin}>{vin}</option>
          ))}
        </select>
      </div>

      {loading && <p className="text-center">⏳ Φόρτωση...</p>}

      {/* Τα αποτελέσματα (αν έχεις επιλέξει VIN) */}
      {!loading && selectedVin && (
        <div>
          {dtcHistory.length === 0 ? (
            <div className="text-center text-green-600">
              ✅ Δεν βρέθηκαν σφάλματα στις καταγραφές αυτού του οχήματος.
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-center">
                Βρέθηκαν {dtcHistory.length} στιγμές με ενεργά σφάλματα:
              </h2>
              <div className="space-y-4">
                {dtcHistory.map((entry, idx) => (
                  <div
                    key={entry._id || idx}
                    className="bg-red-50 border border-red-200 rounded p-4 shadow"
                  >
                    <div className="flex flex-wrap gap-4 text-sm items-center">
                      <div>
                        <strong>🕒 Ημερομηνία:</strong>{" "}
                        {new Date(entry.timestamp).toLocaleString("el-GR")}
                      </div>
                      <div>
                        <strong>⚠️ MIL:</strong>{" "}
                        {entry.milStatus ? "ON" : "OFF"}
                      </div>
                    </div>
                    <div className="mt-2">
                      <strong>🚨 DTC Σφάλματα:</strong>
                      {entry.dtcs && entry.dtcs.length > 0 ? (
                        <ul className="list-disc ml-6">
                          {entry.dtcs.map((dtc, i) => (
                            <li key={i}>
                              <b>{dtc}</b>
                              {" — "}
                              {/* Εμφανίζουμε την περιγραφή αν υπάρχει στο json, αλλιώς "Άγνωστο σφάλμα" */}
                              {dtcCodes[dtc]?.desc || "Άγνωστο σφάλμα"}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span> Κανένα συγκεκριμένο κωδικό</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

