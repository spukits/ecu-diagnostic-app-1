// src/pages/History.jsx
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// Settings helpers
import {
  brandColor,
  chartAnimate,
  isTableCompact,
  textColor,
  dimTextColor,
} from "../settings";

export default function History() {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // UI tokens από Settings
  const primary = brandColor();
  const animate = chartAnimate();
  const compact = isTableCompact();
  const axisColor = textColor();
  const gridColor = dimTextColor();

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: "Bearer " + localStorage.getItem("token"),
  });

  const formatDateTime = (d) =>
    new Date(d).toLocaleString(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  useEffect(() => {
    fetch("/api/car-diagnostics/history", { headers: getHeaders() })
      .then((res) => res.json())
      .then((data) => setHistory(data.reverse()))
      .catch((err) => console.error("Αποτυχία φόρτωσης ιστορικού", err));
    // eslint-disable-next-line
  }, []);

  const deleteOne = async (id) => {
    if (!window.confirm("Διαγραφή καταγραφής;")) return;
    try {
      const res = await fetch(`/api/car-diagnostics/history/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (res.ok) {
        setHistory((prev) => prev.filter((item) => item._id !== id));
      }
    } catch (err) {
      console.error("Σφάλμα διαγραφής καταγραφής", err);
    }
  };

  const filteredHistory = history.filter((car) => {
    const matchesSearch = (car?.vin || "")
      .toLowerCase()
      .includes((search || "").toLowerCase());
    const matchesDate = dateFilter
      ? new Date(car.timestamp).toISOString().slice(0, 10) === dateFilter
      : true;
    return matchesSearch && matchesDate;
  });

  return (
    <div className={`page-wrap space-y-6 ${compact ? "text-sm" : "text-base"}`}>
      <h2 className="title text-center">Ιστορικό Καταγραφών</h2>

      {/* Αναζήτηση & Φίλτρα */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
        <div className="flex-1 flex gap-3">
          <input
            type="text"
            placeholder="Αναζήτηση με VIN…"
            className={`border rounded bg-transparent outline-none ${
              compact ? "px-2 py-1" : "px-3 py-2"
            } w-full md:w-1/2`}
            style={{ borderColor: `${primary}33`, color: axisColor }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <input
            type="date"
            className={`border rounded bg-transparent outline-none ${
              compact ? "px-2 py-1" : "px-3 py-2"
            } w-full md:w-1/3`}
            style={{ borderColor: `${primary}33`, color: axisColor }}
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            title="Φίλτρο ημερομηνίας"
          />
        </div>
      </div>

      {/* Empty state */}
      {filteredHistory.length === 0 ? (
        <p className="text-center muted">
          Δεν βρέθηκαν καταγραφές με τα τρέχοντα φίλτρα.
        </p>
      ) : (
        [...filteredHistory].reverse().map((car, index) => (
          <div
            key={index}
            className="card space-y-3"
            style={{ border: `1px solid ${primary}1a` }}
          >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <div>
                <p className="text-lg font-semibold">VIN: {car.vin}</p>
                <p className="muted text-sm">
                  Καταγράφηκε: {formatDateTime(car.timestamp)}
                </p>
              </div>
              <button
                onClick={() => deleteOne(car._id)}
                className={`rounded text-white text-sm ${
                  compact ? "px-3 py-1.5" : "px-3 py-2"
                }`}
                title="Διαγραφή"
                style={{ backgroundColor: "#ef4444" }}
              >
                Διαγραφή
              </button>
            </div>

            {/* Info grid */}
            <div
              className={`grid grid-cols-2 md:grid-cols-3 ${
                compact ? "gap-3" : "gap-4"
              } text-sm`}
            >
              <p>
                <strong>RPM:</strong> {car.rpm}
              </p>
              <p>
                <strong>Ταχύτητα:</strong> {car.speed} km/h
              </p>
              <p>
                <strong>Θερμ. κινητήρα:</strong> {car.engineTemp}°C
              </p>
              <p>
                <strong>Καύσιμο:</strong> {car.fuelLevel}%
              </p>
              <p>
                <strong>Γκάζι:</strong> {car.throttle}%
              </p>
              <p>
                <strong>Φόρτος κινητήρα:</strong> {car.engineLoad}%
              </p>
              <p>
                <strong>Πίεση εισαγωγής:</strong> {car.intakePressure} kPa
              </p>
              <p>
                <strong>Θερμ. αέρα εισαγωγής:</strong> {car.intakeAirTemp}°C
              </p>
              <p>
                <strong>Χρόνος λειτουργίας:</strong> {car.engineRuntime} s
              </p>
              <p>
                <strong>Πίεση καυσίμου:</strong> {car.fuelPressure} kPa
              </p>
              <p>
                <strong>Check Engine:</strong> {car.milStatus ? "ON" : "OFF"}
              </p>
              <p>
                <strong>DTCs:</strong>{" "}
                {car.dtcs?.length ? car.dtcs.join(", ") : "—"}
              </p>
            </div>

            {/* Charts */}
            <div
              className={`grid grid-cols-1 md:grid-cols-2 ${
                compact ? "gap-3" : "gap-4"
              } mt-2`}
            >
              {[
                { key: "rpm", label: "📈 RPM" },
                { key: "speed", label: "🚗 Ταχύτητα" },
                { key: "engineTemp", label: "🌡️ Θερμοκρασία" },
                { key: "fuelPressure", label: "⛽ Πίεση καυσίμου" },
              ].map(({ key, label }) => (
                <div key={key} className={compact ? "h-32" : "h-36"}>
                  <h4 className="text-sm font-medium muted mb-1">{label}</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[car]}>
                      <XAxis dataKey="timestamp" hide />
                      <YAxis stroke={axisColor} />
                      <Tooltip
                        wrapperStyle={{
                          borderColor: `${primary}66`,
                          color: axisColor,
                          background: "rgba(17,24,39,0.9)",
                        }}
                        labelFormatter={(v) => formatDateTime(v)}
                      />
                      <CartesianGrid stroke={gridColor} strokeDasharray="5 5" />
                      <Line
                        type="monotone"
                        dataKey={key}
                        stroke={primary}
                        dot
                        isAnimationActive={animate}
                        animationDuration={animate ? 650 : 0}
                        animationEasing="ease-in-out"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
