import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DTC_DESCRIPTIONS from "../pages/dtcCodes.json";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// 👉 helpers από Settings
import { brandColor, chartAnimate, isTableCompact } from "../settings";

const ALL_DTC_CODES = Object.keys(DTC_DESCRIPTIONS);

const CarReader = () => {
  const [carName, setCarName] = useState("");
  const [mode, setMode] = useState("demo"); // "demo" | "real"
  const [currentCar, setCurrentCar] = useState(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [message, setMessage] = useState("");
  const intervalRef = useRef(null);
  const navigate = useNavigate();
  const [chartHistory, setChartHistory] = useState([]);

  // === Settings-driven UI flags/colors ===
  const primary = brandColor?.() || "#2563eb"; // fallback μπλε
  const animate = !!chartAnimate?.();
  const compact = !!isTableCompact?.();

  // === Helper: βάλε ΜΟΝΟ μία φορά το DEMO- στο VIN όταν είμαστε σε demo ===
  const normalizeDemoVin = (nameRaw) => {
    const base = (nameRaw || "").replace(/\s/g, "").toUpperCase().substring(0, 12);
    return base.startsWith("DEMO-") ? base : `DEMO-${base}`;
  };

  // Φόρτωση διαθέσιμων οχημάτων
  const fetchVehicles = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/car-diagnostics/history", {
        headers: { Authorization: "Bearer " + token },
      });
      const records = await res.json();

      const seen = new Set();
      const vehiclesUnique = records.filter((r) => {
        const key = (r.carName || r.vin) + "-" + r.mode;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      setVehicles(vehiclesUnique);
    } catch {
      setMessage("❌ Αποτυχία φόρτωσης λίστας οχημάτων.");
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // DEMO: προσομοίωση δεδομένων
  const startSimulation = () => {
    if (!carName.trim()) return;
    setLoading(true);

    setTimeout(() => {
      setConnected(true);

      intervalRef.current = setInterval(() => {
        let dtcs = [];
        if (Math.random() < 0.2) {
          const randomDTC =
            ALL_DTC_CODES[Math.floor(Math.random() * ALL_DTC_CODES.length)];
          dtcs = [randomDTC];
        }

        const simulatedCar = {
          vin: normalizeDemoVin(carName),
          carName,
          rpm: Math.floor(Math.random() * (3500 - 800) + 800),
          speed: Math.floor(Math.random() * 120),
          engineTemp: Math.floor(Math.random() * (100 - 70) + 70),
          fuelLevel: Math.floor(Math.random() * (100 - 10) + 10),
          throttle: Math.floor(Math.random() * 100),
          engineLoad: Math.floor(Math.random() * 100),
          intakePressure: Math.floor(Math.random() * (120 - 80) + 80),
          intakeAirTemp: Math.floor(Math.random() * (40 - 10) + 10),
          engineRuntime: Math.floor(Math.random() * 5000),
          fuelPressure: Math.floor(Math.random() * (400 - 200) + 200),
          milStatus: dtcs.length > 0,
          dtcs,
          timestamp: new Date().toISOString(),
        };

        setCurrentCar(simulatedCar);

        const time = new Date().toLocaleTimeString();
        setChartHistory((prev) => [
          ...prev.slice(-19),
          {
            time,
            rpm: simulatedCar.rpm,
            speed: simulatedCar.speed,
            engineTemp: simulatedCar.engineTemp,
            fuelPressure: simulatedCar.fuelPressure,
          },
        ]);
      }, 2000);

      setLoading(false);
    }, 1200);
  };

  // Σταμάτημα προσομοίωσης
  const stopSimulation = () => {
    clearInterval(intervalRef.current);
    setConnected(false);
    setCurrentCar(null);
    setChartHistory([]);
  };

  // REAL MODE
  const startRealMode = async () => {
    setLoading(true);
    setMessage("");

    const port = prompt("Γράψε τη θύρα του ELM327 (π.χ. COM3):");
    if (!port) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/elm/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ port }),
      });
      const data = await res.json();

      if (res.ok) {
        setConnected(true);
        setMessage("✅ Συνδέθηκες επιτυχώς στο ELM327! Λήψη πραγματικών δεδομένων...");

        intervalRef.current = setInterval(async () => {
          try {
            const resp = await fetch("/api/elm/read");
            if (!resp.ok) return;

            const realData = await resp.json();
            setCurrentCar(realData);

            const time = new Date().toLocaleTimeString();
            setChartHistory((prev) => [
              ...prev.slice(-19),
              {
                time,
                rpm: realData.rpm,
                speed: realData.speed,
                engineTemp: realData.engineTemp,
                fuelPressure: realData.fuelPressure,
              },
            ]);
          } catch {
            setMessage("❌ Πρόβλημα στη λήψη πραγματικών δεδομένων.");
          }
        }, 2000);
      } else {
        setMessage("❌ " + (data.message || "Αποτυχία σύνδεσης"));
      }
    } catch {
      setMessage("❌ Σφάλμα σύνδεσης με backend.");
    }

    setLoading(false);
  };

  // Εναλλαγή modes
  const toggleSimulation = () => {
    if (mode === "demo") {
      connected ? stopSimulation() : startSimulation();
    } else {
      stopSimulation();
      startRealMode();
    }
  };

  // Επιλογή οχήματος από λίστα
  const selectVehicle = (v) => {
    const raw = v.carName || v.vin || "";
    const cleaned = v.mode === "demo" ? raw.replace(/^DEMO-/, "") : raw;
    setCarName(cleaned);
    setMode(v.mode);
    setMessage("");
  };

  // Αποθήκευση
  const saveCarData = async () => {
    if (!currentCar) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/car-diagnostics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          ...currentCar,
          vehicleDisplayName: carName,
          carName,
          vin: currentCar.vin,
          mode,
        }),
      });

      const result = await res.json();
      setMessage(
        res.ok ? "✅ Τα δεδομένα αποθηκεύτηκαν!" : `❌ Σφάλμα: ${result.message}`
      );
      if (res.ok) fetchVehicles();
    } catch {
      setMessage("❌ Αποτυχία αποθήκευσης.");
    }
  };

  useEffect(() => {
    stopSimulation();
    setCurrentCar(null);
    setChartHistory([]);
    setConnected(false);
    // eslint-disable-next-line
  }, [carName, mode]);

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  // === UI ===
  return (
    <div className={`p-6 max-w-4xl mx-auto space-y-4 ${compact ? "text-sm" : "text-base"}`}>
      {/* Επιλογή mode */}
      <div className="flex justify-center mb-2 gap-3">
        {/* Live Data — αριστερά */}
        <button
          className={`px-6 py-2.5 rounded-xl font-semibold text-base transform ${
            mode === "real" ? "text-white scale-105" : "bg-gray-200 scale-105"
          }`}
          style={mode === "real" ? { backgroundColor: primary } : { border: `1px solid ${primary}` }}
          onClick={() => {
            setMode("real");
            stopSimulation();
            setConnected(false);
            setMessage("");
          }}
        >
          Live Data
        </button>

        {/* Demo — δεξιά */}
        <button
          className={`px-5 py-2 rounded-xl font-semibold text-sm transform ${
            mode === "demo" ? "text-white scale-95" : "bg-gray-200 scale-95"
          }`}
          style={mode === "demo" ? { backgroundColor: primary } : { border: `1px solid ${primary}` }}
          onClick={() => {
            setMode("demo");
            stopSimulation();
            setConnected(false);
            setMessage("");
          }}
        >
          Demo Mode
        </button>
      </div>

      {/* Input και κουμπί */}
      <div className="flex flex-col items-center">
        <input
          type="text"
          value={carName}
          onChange={(e) => setCarName(e.target.value)}
          className={`border rounded mb-2 w-64 ${compact ? "p-1.5 text-sm" : "p-2"}`}
          placeholder="Πληκτρολόγησε ή επίλεξε όχημα"
          disabled={connected}
        />
        <button
          onClick={toggleSimulation}
          disabled={loading || connected || !carName.trim()}
          className="w-44 rounded-xl font-semibold text-white"
          style={{
            backgroundColor: loading ? "#6b7280" : primary,
            padding: compact ? "0.6rem 0.75rem" : "0.75rem 1rem",
            opacity: loading ? 0.9 : 1,
          }}
        >
          {loading
            ? "Σύνδεση..."
            : mode === "demo"
            ? "Demo Mode"
            : "Σύνδεση Live Data"}
        </button>
      </div>

      {/* Λίστα επιλογής */}
      <div className="mb-4 flex flex-col items-center">
        <div className="border rounded p-3 w-full max-w-sm bg-white">
          <span className="font-bold text-sm">Επιλογή Οχήματος</span>
          <ul className={`mt-2 ${compact ? "text-xs max-h-24" : "text-sm max-h-32"} overflow-y-auto`}>
            {vehicles.length === 0 && <li>Δεν έχεις αποθηκεύσει όχημα.</li>}
            {vehicles.map((v, idx) => (
              <li
                key={v._id || idx}
                className="truncate cursor-pointer hover:bg-gray-100 px-2 py-1 rounded flex items-center gap-2"
                onClick={() => selectVehicle(v)}
                style={{
                  fontWeight: v.mode === "real" ? 700 : 500,
                  color: primary,
                }}
              >
                <span>
                  {v.mode === "demo"
                    ? (v.carName || v.vin || "").replace(/^DEMO-/, "")
                    : v.carName || v.vin}
                </span>
                <span className="text-gray-400 ml-1">({v.vin})</span>
                <span
                  style={{
                    fontSize: 10,
                    color: primary,
                    border: `1px solid ${primary}33`,
                    borderRadius: 5,
                    padding: "1px 6px",
                    marginLeft: 6,
                  }}
                >
                  {v.mode === "real" ? "REAL" : "DEMO"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Real-Time Data & Charts */}
      {connected && currentCar && (
        <div className={`bg-gray-100 rounded shadow ${compact ? "p-3 text-sm" : "p-4 text-sm"}`}>
          <h3 className="text-lg font-semibold mb-3">📡 Real-Time Δεδομένα</h3>

          <div className={`grid grid-cols-2 md:grid-cols-3 text-gray-800 ${compact ? "gap-2" : "gap-3"}`}>
            {Object.entries({
              "Όχημα": currentCar.carName,
              VIN: currentCar.vin,
              RPM: currentCar.rpm,
              "Ταχύτητα": `${currentCar.speed} km/h`,
              "Θερμοκρασία Κινητήρα": `${currentCar.engineTemp} °C`,
              "Καύσιμο": `${currentCar.fuelLevel}%`,
              "Πίεση Καυσίμου": `${currentCar.fuelPressure} kPa`,
              "Θέση Πεταλούδας": `${currentCar.throttle}%`,
              "Φορτίο Κινητήρα": `${currentCar.engineLoad}%`,
              "Πίεση Εισαγωγής": `${currentCar.intakePressure} kPa`,
              "Θερμοκρασία Αέρα": `${currentCar.intakeAirTemp} °C`,
              Runtime: `${currentCar.engineRuntime} sec`,
              "Check Engine": currentCar.milStatus ? "ON" : "OFF",
            }).map(([key, val]) => (
              <p key={key}>
                <strong>{key}:</strong> {val}
              </p>
            ))}

            <div className="col-span-2 md:col-span-3">
              <strong>DTCs:</strong>{" "}
              {currentCar.dtcs.length
                ? currentCar.dtcs.map((code) => (
                    <span key={code} className="block text-sm" style={{ color: primary }}>
                      {code} - {DTC_DESCRIPTIONS[code]?.desc}
                    </span>
                  ))
                : "Καμία"}
            </div>
          </div>

          {/* Διαγράμματα */}
          <div className={`mt-8 grid grid-cols-1 md:grid-cols-2 ${compact ? "gap-3" : "gap-4"}`}>
            {[
              { key: "rpm", label: "RPM", strokeOpacity: 1.0 },
              { key: "speed", label: "Ταχύτητα (km/h)", strokeOpacity: 0.9 },
              { key: "engineTemp", label: "Θερμοκρασία Κινητήρα (°C)", strokeOpacity: 0.85 },
              { key: "fuelPressure", label: "Πίεση Καυσίμου (kPa)", strokeOpacity: 0.8 },
            ].map(({ key, label, strokeOpacity }) => (
              <div key={key} className="bg-white rounded shadow p-3">
                <span className="font-semibold text-xs">{label}</span>
                <ResponsiveContainer width="100%" height={compact ? 120 : 160}>
                  <LineChart data={chartHistory}>
                    <XAxis dataKey="time" fontSize={compact ? 9 : 10} />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip wrapperStyle={{ borderColor: primary }} />
                    <Line
                      type="monotone"
                      dataKey={key}
                      stroke={primary}
                      strokeOpacity={strokeOpacity}
                      dot={false}
                      isAnimationActive={animate}
                      animationDuration={animate ? 650 : 0}
                      animationEasing="ease-in-out"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>

          {/* Κουμπιά */}
          <div className={`mt-6 flex gap-4 ${compact ? "text-sm" : ""}`}>
            <button
              onClick={saveCarData}
              className="text-white py-2 px-4 rounded"
              style={{ backgroundColor: primary }}
              disabled={!currentCar}
            >
              Αποθήκευση Δεδομένων
            </button>
            <button
              onClick={() => navigate(`/dashboard?car=${currentCar.vin}`)}
              className="text-white py-2 px-4 rounded"
              style={{ backgroundColor: primary, opacity: 0.95 }}
            >
              Προβολή Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Μηνύματα */}
      {message && <p className="text-center">{message}</p>}
    </div>
  );
};

export default CarReader;
