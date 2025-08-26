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

const ALL_DTC_CODES = Object.keys(DTC_DESCRIPTIONS);

const CarReader = () => {
  const [carName, setCarName] = useState("");
  const [mode, setMode] = useState("demo");
  const [currentCar, setCurrentCar] = useState(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [message, setMessage] = useState("");
  const intervalRef = useRef(null);
  const navigate = useNavigate();
  const [chartHistory, setChartHistory] = useState([]);

  // Φόρτωση διαθέσιμων οχημάτων
  const fetchVehicles = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/car-diagnostics/history", {
        headers: { Authorization: "Bearer " + token },
      });
      const records = await res.json();
      const seen = new Set();
      const vehiclesUnique = records.filter(r => {
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

  // DEMO: προσομοίωση δεδομένων με πιθανότητα για DTC
  const startSimulation = () => {
    if (!carName.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setConnected(true);
      intervalRef.current = setInterval(() => {
        let dtcs = [];
        if (Math.random() < 0.2) {
          const randomDTC = ALL_DTC_CODES[Math.floor(Math.random() * ALL_DTC_CODES.length)];
          dtcs = [randomDTC];
        }
        const simulatedCar = {
          vin: "DEMO-" + carName.replace(/\s/g, '').toUpperCase().substring(0, 12),
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

  // Σταμάτημα προσομοίωσης/demo ή real mode
  const stopSimulation = () => {
    clearInterval(intervalRef.current);
    setConnected(false);
    setCurrentCar(null);
    setChartHistory([]);
  };

  // ----------- REAL MODE LOGIC -------------
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
        // Εδώ ξεκίνα να κάνεις fetch τα πραγματικά δεδομένα
        intervalRef.current = setInterval(async () => {
          try {
            const resp = await fetch("/api/elm/read"); // πρέπει να έχεις φτιάξει αυτό το route στο backend!
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
          } catch (err) {
            setMessage("❌ Πρόβλημα στη λήψη πραγματικών δεδομένων.");
          }
        }, 2000);
      } else {
        setMessage("❌ " + (data.message || "Αποτυχία σύνδεσης"));
      }
    } catch (err) {
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
    setCarName(v.carName || v.vin);
    setMode(v.mode);
    setMessage("");
  };

  // Αποθήκευση τρέχοντος οχήματος
  const saveCarData = async () => {
    if (!currentCar) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/car-diagnostics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
        },
        body: JSON.stringify({ ...currentCar, carName, vin: currentCar.vin, mode }),
      });
      const result = await res.json();
      setMessage(res.ok ? "✅ Τα δεδομένα αποθηκεύτηκαν!" : `❌ Σφάλμα: ${result.message}`);
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

  // UI
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      {/* Επιλογή mode */}
      <div className="flex justify-center mb-2 gap-3">
        <button
          className={`px-5 py-2 rounded-xl font-semibold ${mode === "demo" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          onClick={() => { setMode("demo"); stopSimulation(); setConnected(false); setMessage(""); }}
        >
          Demo Mode
        </button>
        <button
          className={`px-5 py-2 rounded-xl font-semibold ${mode === "real" ? "bg-green-600 text-white" : "bg-gray-200"}`}
          onClick={() => { setMode("real"); stopSimulation(); setConnected(false); setMessage(""); }}
        >
          Πραγματικά Δεδομένα
        </button>
      </div>

      {/* Input και κουμπί */}
      <div className="flex flex-col items-center">
        <input
          type="text"
          value={carName}
          onChange={e => setCarName(e.target.value)}
          className="p-2 border rounded mb-2 w-64"
          placeholder="Πληκτρολόγησε ή επίλεξε όχημα"
          disabled={connected}
        />
        <button
          onClick={toggleSimulation}
          disabled={loading || connected || !carName.trim()}
          className={`w-44 py-3 rounded-xl font-semibold text-white ${
            loading ? "bg-gray-500" : mode === "demo" ? "bg-blue-600" : "bg-green-600"
          }`}
        >
          {loading ? "Σύνδεση..." : mode === "demo" ? "Demo Mode" : "Σύνδεση Real Mode"}
        </button>
      </div>

      {/* Λίστα επιλογής */}
      <div className="mb-4 flex flex-col items-center">
        <div className="border rounded p-3 w-full max-w-sm bg-white">
          <span className="font-bold text-sm">Επιλογή Οχήματος</span>
          <ul className="mt-2 text-xs max-h-32 overflow-y-auto">
            {vehicles.length === 0 && <li>Δεν έχεις αποθηκεύσει όχημα.</li>}
            {vehicles.map((v, idx) => (
              <li
                key={v._id || idx}
                className="truncate cursor-pointer hover:bg-gray-100 px-2 py-1 rounded flex items-center gap-2"
                onClick={() => selectVehicle(v)}
                style={{
                  fontWeight: v.mode === "real" ? 700 : 500,
                  color: v.mode === "real" ? "#099f24" : "#0366d6"
                }}
              >
                <span>{v.carName || v.vin}</span>
                <span className="text-gray-400 ml-1">({v.vin})</span>
                <span style={{
                  fontSize: 10,
                  color: v.mode === "real" ? "#099f24" : "#0366d6",
                  border: "1px solid #eee",
                  borderRadius: 5,
                  padding: "1px 6px",
                  marginLeft: 6
                }}>
                  {v.mode === "real" ? "REAL" : "DEMO"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Real-Time Data & Charts */}
      {connected && currentCar && (
        <div className="bg-gray-100 p-4 rounded shadow text-sm">
          <h3 className="text-lg font-semibold mb-3">📡 Real-Time Δεδομένα</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-gray-800">
            {Object.entries({
              "Όχημα": currentCar.carName,
              "VIN": currentCar.vin,
              "RPM": currentCar.rpm,
              "Ταχύτητα": `${currentCar.speed} km/h`,
              "Θερμοκρασία Κινητήρα": `${currentCar.engineTemp} °C`,
              "Καύσιμο": `${currentCar.fuelLevel}%`,
              "Πίεση Καυσίμου": `${currentCar.fuelPressure} kPa`,
              "Θέση Πεταλούδας": `${currentCar.throttle}%`,
              "Φορτίο Κινητήρα": `${currentCar.engineLoad}%`,
              "Πίεση Εισαγωγής": `${currentCar.intakePressure} kPa`,
              "Θερμοκρασία Αέρα": `${currentCar.intakeAirTemp} °C`,
              "Runtime": `${currentCar.engineRuntime} sec`,
              "Check Engine": currentCar.milStatus ? "ON" : "OFF",
            }).map(([key, val]) => (
              <p key={key}><strong>{key}:</strong> {val}</p>
            ))}
            <div className="col-span-2 md:col-span-3">
              <strong>DTCs:</strong>{" "}
              {currentCar.dtcs.length
                ? currentCar.dtcs.map(code => (
                    <span key={code} className="block text-sm text-red-700">
                      {code} - {DTC_DESCRIPTIONS[code]?.desc}
                    </span>
                  ))
                : "Καμία"}
            </div>
          </div>
          {/* Διαγράμματα */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded shadow p-3">
              <span className="font-semibold text-xs">RPM</span>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={chartHistory}>
                  <XAxis dataKey="time" fontSize={10} />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Line type="monotone" dataKey="rpm" stroke="#1565c0" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded shadow p-3">
              <span className="font-semibold text-xs">Ταχύτητα (km/h)</span>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={chartHistory}>
                  <XAxis dataKey="time" fontSize={10} />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Line type="monotone" dataKey="speed" stroke="#43a047" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded shadow p-3">
              <span className="font-semibold text-xs">Θερμοκρασία Κινητήρα (°C)</span>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={chartHistory}>
                  <XAxis dataKey="time" fontSize={10} />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Line type="monotone" dataKey="engineTemp" stroke="#ef6c00" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded shadow p-3">
              <span className="font-semibold text-xs">Πίεση Καυσίμου (kPa)</span>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={chartHistory}>
                  <XAxis dataKey="time" fontSize={10} />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Line type="monotone" dataKey="fuelPressure" stroke="#8e24aa" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Κουμπιά */}
          <div className="mt-6 flex gap-4">
            <button
              onClick={saveCarData}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
              disabled={!currentCar}
            >
              Αποθήκευση Δεδομένων
            </button>
            <button
              onClick={() => navigate(`/dashboard?car=${currentCar.vin}`)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded"
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



