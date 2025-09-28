import React, { useEffect, useState } from "react";
import dtcCodes from "../pages/dtcCodes.json";

// ✅ Settings helpers
import {
  brandColor,
  isTableCompact,
  textColor,
  dimTextColor,
} from "../settings";

export default function Diagnostics() {
  const [vinList, setVinList] = useState([]);
  const [selectedVin, setSelectedVin] = useState("");
  const [dtcHistory, setDtcHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🎨 Settings tokens
  const primary = brandColor();
  const compact = isTableCompact();
  const fg = textColor();
  const fgDim = dimTextColor();

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: "Bearer " + localStorage.getItem("token"),
  });

  useEffect(() => {
    fetch("/api/car-diagnostics/history", { headers: getHeaders() })
      .then((res) => res.json())
      .then((data) => {
        const vins = Array.from(new Set(data.map((entry) => entry.vin)));
        setVinList(vins);
      });
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!selectedVin) return;
    setLoading(true);
    fetch(`/api/car-diagnostics/history?carId=${selectedVin}`, {
      headers: getHeaders(),
    })
      .then((res) => res.json())
      .then((data) => {
        const filtered = data
          .filter(
            (entry) =>
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
    <div className={`page-wrap space-y-6 ${compact ? "text-sm" : "text-base"}`}>
      <h1
        className="title text-center"
        style={{ color: fg }}
      >
        🛠️ Διαγνωστικά Οχήματος (Ιστορικό Προβλημάτων)
      </h1>

      {/* Επιλογή VIN */}
      <div className="space-y-4 text-center">
        <select
          value={selectedVin}
          onChange={(e) => setSelectedVin(e.target.value)}
          className={`${compact ? "px-2 py-1" : "p-2"} border rounded`}
          style={{
            borderColor: `${primary}33`,
            color: fg,
            background: "transparent",
          }}
        >
          <option value="">-- Επιλέξτε VIN --</option>
          {vinList.map((vin) => (
            <option key={vin} value={vin} style={{ color: "#000" }}>
              {vin}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-center muted">⏳ Φόρτωση...</p>}

      {!loading && selectedVin && (
        <div>
          {dtcHistory.length === 0 ? (
            <div className="text-center" style={{ color: "#22c55e" }}>
              ✅ Δεν βρέθηκαν σφάλματα στις καταγραφές αυτού του οχήματος.
            </div>
          ) : (
            <div className="space-y-4">
              <h2
                className="text-lg font-semibold text-center"
                style={{ color: fg }}
              >
                Βρέθηκαν {dtcHistory.length} στιγμές με ενεργά σφάλματα:
              </h2>
              {dtcHistory.map((entry, idx) => (
                <div
                  key={entry._id || idx}
                  className="rounded p-4 shadow"
                  style={{
                    background: `${primary}0d`,
                    border: `1px solid ${primary}33`,
                    color: fg,
                  }}
                >
                  <div
                    className="flex flex-wrap gap-4 items-center"
                    style={{ color: fgDim }}
                  >
                    <div>
                      <strong style={{ color: fg }}>🕒 Ημερομηνία:</strong>{" "}
                      {new Date(entry.timestamp).toLocaleString("el-GR")}
                    </div>
                    <div>
                      <strong style={{ color: fg }}>⚠️ MIL:</strong>{" "}
                      {entry.milStatus ? "ON" : "OFF"}
                    </div>
                  </div>
                  <div className="mt-2">
                    <strong style={{ color: fg }}>🚨 DTC Σφάλματα:</strong>
                    {entry.dtcs && entry.dtcs.length > 0 ? (
                      <ul className="list-disc ml-6">
                        {entry.dtcs.map((dtc, i) => (
                          <li key={i} style={{ color: fg }}>
                            <b>{dtc}</b> —{" "}
                            {dtcCodes[dtc]?.desc || "Άγνωστο σφάλμα"}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span style={{ color: fgDim }}>
                        {" "}
                        Κανένα συγκεκριμένο κωδικό
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
