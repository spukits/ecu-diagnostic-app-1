// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from "recharts";

// Settings helpers
import {
  brandColor,
  chartAnimate,
  isTableCompact,
  textColor,
  dimTextColor,
} from "../settings";

// JWT headers helper
const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: "Bearer " + localStorage.getItem("token"),
});

export default function Dashboard() {
  const [vinList, setVinList] = useState([]);
  const [selectedVin, setSelectedVin] = useState("");
  const [carData, setCarData] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🎨 UI tokens από Settings
  const primary = brandColor();
  const animate = chartAnimate();
  const compact = isTableCompact();
  const axis = textColor();
  const grid = dimTextColor();

  // Φόρτωση VINs
  useEffect(() => {
    fetch("/api/car-diagnostics/history", { headers: getHeaders() })
      .then(res => res.json())
      .then(data => {
        const arr = Array.isArray(data) ? data : [];
        const vins = Array.from(new Set(arr.map((e) => e.vin)));
        setVinList(vins);
        if (vins.length > 0 && !selectedVin) setSelectedVin(vins[0]);
      })
      .catch(() => setVinList([]));
    // eslint-disable-next-line
  }, []);

  // Φόρτωση ιστορικού για το VIN
  useEffect(() => {
    if (!selectedVin) return;
    setLoading(true);
    fetch(`/api/car-diagnostics/history?carId=${selectedVin}`, { headers: getHeaders() })
      .then(res => res.json())
      .then(data => {
        const arr = Array.isArray(data) ? data : [];
        setCarData(arr.reverse());
        setLoading(false);
      })
      .catch(() => {
        setCarData([]);
        setLoading(false);
      });
    // eslint-disable-next-line
  }, [selectedVin]);

  const mean = arr => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : "-";
  const totalRecords = carData.length;
  const avgRpm = mean(carData.map(x => x.rpm));
  const avgSpeed = mean(carData.map(x => x.speed));
  const avgTemp = mean(carData.map(x => x.engineTemp));
  const avgFuelPressure = mean(carData.map(x => x.fuelPressure));
  const last = carData.length > 0 ? carData[0] : null;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div
          className="rounded shadow text-xs p-2"
          style={{
            background: "rgba(15, 23, 42, 0.95)",
            color: axis,
            border: `1px solid ${primary}66`,
          }}
        >
          <div>
            <strong>Ημ/νία:</strong>{" "}
            {d.timestamp ? new Date(d.timestamp).toLocaleString("el-GR") : ""}
          </div>
          {Object.entries(d).map(([k, v]) => {
            if (["timestamp", "vin", "_id"].includes(k)) return null;
            return (
              <div key={k}>
                <strong>{k}:</strong> {v}
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  // κοινές ρυθμίσεις chart
  const chartData = carData.slice(0, 10).reverse();
  const chartHeight = compact ? "h-44" : "h-48";

  return (
    <div className={`page-wrap space-y-8 ${compact ? "text-sm" : "text-base"}`}>
      <h1 className="title text-center flex items-center justify-center gap-3">
        📊 ECU Dashboard
      </h1>

      {/* Επιλογή VIN */}
      <div className="flex flex-col items-center space-y-2 mb-2">
        <select
          value={selectedVin}
          onChange={e => setSelectedVin(e.target.value)}
          className={`${compact ? "px-2 py-1" : "p-2"} border rounded max-w-xs w-full bg-transparent`}
          style={{ borderColor: `${primary}33`, color: axis }}
        >
          <option value="">-- Επιλέξτε Όχημα (VIN) --</option>
          {vinList.map(vin => (
            <option key={vin} value={vin} style={{ color: "#000" }}>
              {vin}
            </option>
          ))}
        </select>
      </div>

      {/* Στατιστικά συνολικά */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Σύνολο Καταγραφών", value: totalRecords, unit: "", tone: 1.0 },
          { label: "Μέσος RPM", value: avgRpm, unit: " rpm", tone: 0.95 },
          { label: "Μέση Θερμοκρασία", value: avgTemp, unit: " °C", tone: 0.9 },
          { label: "Μέση Ταχύτητα", value: avgSpeed, unit: " km/h", tone: 0.85 },
        ].map((x, i) => (
          <div key={i} className="card text-center">
            <div
              className={`${compact ? "text-xl" : "text-2xl"} font-bold`}
              style={{ color: primary, opacity: x.tone }}
            >
              {x.value}{x.unit}
            </div>
            <div className="muted text-sm">{x.label}</div>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <div className="card text-center w-80">
          <div
            className={`${compact ? "text-xl" : "text-2xl"} font-bold`}
            style={{ color: primary, opacity: 0.9 }}
          >
            {avgFuelPressure} kPa
          </div>
          <div className="muted text-sm">Μέση Πίεση Καυσίμου</div>
        </div>
      </div>

      {/* Καταγραφές */}
      <div className="card space-y-4" style={{ border: `1px solid ${primary}1a` }}>
        <h2 className={`${compact ? "text-lg" : "text-xl"} font-bold mb-2`} style={{ color: axis }}>
          Καταγραφές
        </h2>

        {loading ? (
          <div className="muted">Φόρτωση...</div>
        ) : last ? (
          <>
            <div><strong>VIN:</strong> {last.vin}</div>

            <div className="mb-2">
              <strong>Ημερομηνίες:</strong>{" "}
              {carData.slice(0, 10).map((rec, i) => (
                <span
                  key={rec._id || i}
                  className="inline-block mr-2 px-2 py-1 rounded text-xs shadow"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: `1px solid ${primary}22`,
                  }}
                >
                  {new Date(rec.timestamp).toLocaleString("el-GR")}
                </span>
              ))}
            </div>

            {/* 4 charts */}
            <div className={`grid grid-cols-1 md:grid-cols-2 ${compact ? "gap-4" : "gap-6"} mt-2`}>
              {[
                { key: "rpm", label: "RPM", opacity: 1.0 },
                { key: "speed", label: "Ταχύτητα", opacity: 0.95 },
                { key: "engineTemp", label: "Θερμοκρασία", opacity: 0.9 },
                { key: "fuelPressure", label: "Πίεση Καυσίμου", opacity: 0.85 },
              ].map(({ key, label, opacity }) => (
                <div key={key} className={`${chartHeight} rounded-xl shadow p-3 flex flex-col`} style={{ background: "var(--bg-card)" }}>
                  <h4 className="text-sm mb-1" style={{ color: grid }}>{label}</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <XAxis
                        dataKey="timestamp"
                        tickFormatter={v => new Date(v).toLocaleTimeString("el-GR")}
                        fontSize={10}
                        stroke={axis}
                      />
                      <YAxis stroke={axis} />
                      <Tooltip content={<CustomTooltip />} />
                      <CartesianGrid stroke={grid} strokeDasharray="5 5" />
                      <Line
                        type="monotone"
                        dataKey={key}
                        stroke={primary}
                        strokeOpacity={opacity}
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
          </>
        ) : (
          <div className="muted">Δεν βρέθηκαν καταγραφές για το όχημα.</div>
        )}
      </div>
    </div>
  );
}
