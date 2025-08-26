import { useEffect, useState } from "react";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export default function Export() {
  const [vinList, setVinList] = useState([]);
  const [selectedVin, setSelectedVin] = useState("");
  const [carData, setCarData] = useState([]);

  // Helper για headers με JWT token
  const getHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": "Bearer " + localStorage.getItem("token"),
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
    // Διόρθωση: Σωστό query param (carId για να παίζει και σε εσένα!)
    fetch(`/api/car-diagnostics/history?carId=${selectedVin}`, { headers: getHeaders() })
      .then((res) => res.json())
      .then((data) => setCarData(data.reverse()));
    // eslint-disable-next-line
  }, [selectedVin]);

  const exportExcel = () => {
    if (!carData.length) return;
    const worksheet = XLSX.utils.json_to_sheet(carData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Diagnostics");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${selectedVin}_diagnostics.xlsx`);
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

    const headers = [[
      "Date", "RPM", "Speed", "Engine Temp", "Fuel Level", "Throttle",
      "Engine Load", "Intake Pressure", "Air Temp", "Runtime", "Fuel Pressure",
      "Check Engine", "DTCs"
    ]];

    const rows = carData.map((item) => [
      new Date(item.timestamp).toISOString().replace("T", " ").slice(0, 19),
      item.rpm,
      item.speed,
      item.engineTemp,
      item.fuelLevel,
      item.throttle,
      item.engineLoad,
      item.intakePressure,
      item.intakeAirTemp,
      item.engineRuntime,
      item.fuelPressure,
      item.milStatus ? "ON" : "OFF",
      item.dtcs && item.dtcs.length ? item.dtcs.join(", ") : "None"
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
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center text-gray-800">
        📤 Εξαγωγή Δεδομένων Οχήματος
      </h1>

      <div className="text-center space-y-4">
        <select
          value={selectedVin}
          onChange={(e) => setSelectedVin(e.target.value)}
          className="p-2 border rounded w-full max-w-xs"
        >
          <option value="">-- Επιλέξτε VIN --</option>
          {vinList.map((vin) => (
            <option key={vin} value={vin}>
              {vin}
            </option>
          ))}
        </select>

        {selectedVin && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Καταγραφές: {carData.length}</p>
            <button
              onClick={exportExcel}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Εξαγωγή σε Excel
            </button>
            <button
              onClick={exportJSON}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded ml-2"
            >
              Εξαγωγή σε JSON
            </button>
            <button
              onClick={exportPDF}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded ml-2"
            >
              Εξαγωγή σε PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
}



