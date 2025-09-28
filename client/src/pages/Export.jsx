// src/pages/Export.jsx
import { useEffect, useState } from "react";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// Settings helpers
import {
  brandColor,
  isTableCompact,
  textColor,
  dimTextColor,
} from "../settings";

export default function Export() {
  const [vinList, setVinList] = useState([]);
  const [selectedVin, setSelectedVin] = useState("");
  const [carData, setCarData] = useState([]);

  // 🎨 UI tokens
  const primary = brandColor();
  const compact = isTableCompact();
  const fg = textColor();
  const fgDim = dimTextColor();

  // JWT headers
  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: "Bearer " + localStorage.getItem("token"),
  });

  useEffect(() => {
    fetch("/api/car-diagnostics/history", { headers: getHeaders() })
      .then((res) => res.json())
      .then((data) => {
        const vins = Array.from(new Set((data || []).map((e) => e.vin)));
        setVinList(vins);
      })
      .catch(() => setVinList([]));
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!selectedVin) return;
    fetch(`/api/car-diagnostics/history?carId=${selectedVin}`, {
      headers: getHeaders(),
    })
      .then((res) => res.json())
      .then((data) => setCarData((Array.isArray(data) ? data : []).reverse()))
      .catch(() => setCarData([]));
    // eslint-disable-next-line
  }, [selectedVin]);

  // ===== Exports =====
  const exportExcel = () => {
    if (!carData.length) return;
    const ws = XLSX.utils.json_to_sheet(carData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Diagnostics");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([buf], {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `${selectedVin}_diagnostics.xlsx`
    );
  };

  const exportJSON = () => {
    if (!carData.length) return;
    const blob = new Blob([JSON.stringify(carData, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    saveAs(blob, `${selectedVin}_diagnostics.json`);
  };

  const exportPDF = () => {
    if (!carData.length) return;
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(`Vehicle Diagnostics - VIN: ${selectedVin}`, 14, 15);

    const headers = [
      [
        "Date",
        "RPM",
        "Speed",
        "Engine Temp",
        "Fuel Level",
        "Throttle",
        "Engine Load",
        "Intake Pressure",
        "Air Temp",
        "Runtime",
        "Fuel Pressure",
        "Check Engine",
        "DTCs",
      ],
    ];

    const rows = carData.map((it) => [
      new Date(it.timestamp).toISOString().replace("T", " ").slice(0, 19),
      it.rpm,
      it.speed,
      it.engineTemp,
      it.fuelLevel,
      it.throttle,
      it.engineLoad,
      it.intakePressure,
      it.intakeAirTemp,
      it.engineRuntime,
      it.fuelPressure,
      it.milStatus ? "ON" : "OFF",
      it.dtcs?.length ? it.dtcs.join(", ") : "None",
    ]);

    autoTable(doc, {
      startY: 25,
      head: headers,
      body: rows,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [22, 160, 133] },
    });

    doc.save(`${selectedVin}_diagnostics.pdf`);
  };

  return (
    <div className={`page-wrap space-y-6 ${compact ? "text-sm" : "text-base"}`}>
      <h1 className="title text-center">📤 Εξαγωγή Δεδομένων Οχήματος</h1>

      {/* Επιλογή VIN */}
      <div className="text-center space-y-4">
        <select
          value={selectedVin}
          onChange={(e) => setSelectedVin(e.target.value)}
          className={`${compact ? "px-2 py-1" : "p-2"} border rounded w-full max-w-xs bg-transparent`}
          style={{ borderColor: `${primary}33`, color: fg }}
        >
          <option value="">-- Επιλέξτε VIN --</option>
          {vinList.map((vin) => (
            <option key={vin} value={vin} style={{ color: "#000" }}>
              {vin}
            </option>
          ))}
        </select>

        {selectedVin && (
          <div className="space-y-3">
            <p className="muted">
              Καταγραφές: <span style={{ color: fg }}>{carData.length}</span>
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={exportExcel}
                className={`btn ${compact ? "px-3 py-1.5" : "px-4 py-2"}`}
                style={{
                  borderColor: `${primary}66`,
                  background: `color-mix(in oklab, ${primary} 14%, transparent)`,
                  color: fg,
                }}
              >
                Εξαγωγή σε Excel
              </button>

              <button
                onClick={exportJSON}
                className={`btn ${compact ? "px-3 py-1.5" : "px-4 py-2"}`}
                style={{
                  borderColor: `${primary}66`,
                  background: `color-mix(in oklab, ${primary} 14%, transparent)`,
                  color: fg,
                }}
              >
                Εξαγωγή σε JSON
              </button>

              <button
                onClick={exportPDF}
                className={`btn ${compact ? "px-3 py-1.5" : "px-4 py-2"}`}
                style={{
                  borderColor: `${primary}66`,
                  background: `color-mix(in oklab, ${primary} 14%, transparent)`,
                  color: fg,
                }}
              >
                Εξαγωγή σε PDF
              </button>
            </div>
          </div>
        )}
      </div>

      {/* (προαιρετικά) preview / summary κάρτα */}
      {selectedVin && (
        <div className="card" style={{ border: `1px solid ${primary}1a` }}>
          <div className="flex items-center justify-between">
            <div className="font-semibold">VIN: {selectedVin}</div>
            <div className="muted text-sm">Σύνολο εγγραφών: {carData.length}</div>
          </div>
        </div>
      )}
    </div>
  );
}
