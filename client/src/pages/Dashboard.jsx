import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from "recharts";

// Helper για να περνάς τα headers με το JWT token
const getHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": "Bearer " + localStorage.getItem("token"),
});

export default function Dashboard() {
  const [vinList, setVinList] = useState([]);
  const [selectedVin, setSelectedVin] = useState("");
  const [carData, setCarData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Όταν φορτώσει η σελίδα, φέρνουμε όλα τα διαθέσιμα VIN
  useEffect(() => {
    fetch("/api/car-diagnostics/history", { headers: getHeaders() })
      .then(res => res.json())
      .then(data => {
        const arr = Array.isArray(data) ? data : [];
        const vins = Array.from(new Set(arr.map((entry) => entry.vin)));
        setVinList(vins);
        if (vins.length > 0 && !selectedVin) setSelectedVin(vins[0]);
      })
      .catch(() => setVinList([]));
    // eslint-disable-next-line
  }, []);

  // Όταν αλλάζει το VIN, φέρνουμε τα ιστορικά του
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

  // Βοηθητικό για μέσο όρο
  const mean = arr => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : "-";
  const totalRecords = carData.length;
  const avgRpm = mean(carData.map(x => x.rpm));
  const avgSpeed = mean(carData.map(x => x.speed));
  const avgTemp = mean(carData.map(x => x.engineTemp));
  const avgFuelPressure = mean(carData.map(x => x.fuelPressure));
  const last = carData.length > 0 ? carData[0] : null;

  // Tooltip που εμφανίζει όμορφα την ημερομηνία
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white p-2 rounded shadow text-xs">
          <div>
            <strong>Ημ/νία:</strong> {d.timestamp ? new Date(d.timestamp).toLocaleString("el-GR") : ""}
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

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-6 flex items-center justify-center gap-3">
        <span role="img" aria-label="chart">📊</span> ECU Dashboard
      </h1>

      {/* Επιλογή VIN (όχημα) */}
      <div className="flex flex-col items-center space-y-2 mb-6">
        <select
          value={selectedVin}
          onChange={e => setSelectedVin(e.target.value)}
          className="p-2 border rounded max-w-xs w-full"
        >
          <option value="">-- Επιλέξτε Όχημα (VIN) --</option>
          {vinList.map(vin => (
            <option key={vin} value={vin}>{vin}</option>
          ))}
        </select>
      </div>

      {/* Στατιστικά συνολικά */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white shadow p-6 rounded-xl text-center">
          <div className="text-2xl font-bold text-blue-700">{totalRecords}</div>
          <div className="text-sm text-gray-500">Σύνολο Καταγραφών</div>
        </div>
        <div className="bg-white shadow p-6 rounded-xl text-center">
          <div className="text-2xl font-bold text-green-700">{avgRpm} rpm</div>
          <div className="text-sm text-gray-500">Μέσος RPM</div>
        </div>
        <div className="bg-white shadow p-6 rounded-xl text-center">
          <div className="text-2xl font-bold text-orange-600">{avgTemp} °C</div>
          <div className="text-sm text-gray-500">Μέση Θερμοκρασία</div>
        </div>
        <div className="bg-white shadow p-6 rounded-xl text-center">
          <div className="text-2xl font-bold text-purple-600">{avgSpeed} km/h</div>
          <div className="text-sm text-gray-500">Μέση Ταχύτητα</div>
        </div>
      </div>
      <div className="flex justify-center">
        <div className="bg-white shadow p-6 rounded-xl text-center w-80">
          <div className="text-2xl font-bold text-pink-600">{avgFuelPressure} kPa</div>
          <div className="text-sm text-gray-500">Μέση Πίεση Καυσίμου</div>
        </div>
      </div>

      {/* Καταγραφές */}
      <div className="bg-blue-50 p-6 rounded-xl shadow space-y-4">
        <h2 className="text-xl font-bold mb-2">Καταγραφές</h2>
        {loading ? (
          <div>Φόρτωση...</div>
        ) : last ? (
          <>
            {/* VIN */}
            <div>
              <strong>VIN:</strong> {last.vin}
            </div>
            {/* Όλες οι ημερομηνίες καταγραφών (πρώτες 10) */}
            <div className="mb-2">
              <strong>Ημερομηνίες:</strong>{" "}
              {carData.slice(0, 10).map((rec, i) =>
                <span key={rec._id || i} className="inline-block mr-2 bg-white px-2 py-1 rounded text-xs shadow">
                  {new Date(rec.timestamp).toLocaleString("el-GR")}
                </span>
              )}
            </div>
            {/* Δύο-δύο τα γραφήματα */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {/* RPM */}
              <div className="h-48 bg-white rounded-xl shadow p-3 flex flex-col">
                <h4 className="text-sm text-gray-600 mb-1">RPM</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={carData.slice(0, 10).reverse()}>
                    <XAxis dataKey="timestamp" tickFormatter={v => new Date(v).toLocaleTimeString("el-GR")} fontSize={10} />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                    <Line type="monotone" dataKey="rpm" stroke="#8884d8" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {/* Ταχύτητα */}
              <div className="h-48 bg-white rounded-xl shadow p-3 flex flex-col">
                <h4 className="text-sm text-gray-600 mb-1">Ταχύτητα</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={carData.slice(0, 10).reverse()}>
                    <XAxis dataKey="timestamp" tickFormatter={v => new Date(v).toLocaleTimeString("el-GR")} fontSize={10} />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                    <Line type="monotone" dataKey="speed" stroke="#82ca9d" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {/* Θερμοκρασία */}
              <div className="h-48 bg-white rounded-xl shadow p-3 flex flex-col">
                <h4 className="text-sm text-gray-600 mb-1">Θερμοκρασία</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={carData.slice(0, 10).reverse()}>
                    <XAxis dataKey="timestamp" tickFormatter={v => new Date(v).toLocaleTimeString("el-GR")} fontSize={10} />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                    <Line type="monotone" dataKey="engineTemp" stroke="#ff7300" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {/* Πίεση Καυσίμου */}
              <div className="h-48 bg-white rounded-xl shadow p-3 flex flex-col">
                <h4 className="text-sm text-gray-600 mb-1">Πίεση Καυσίμου</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={carData.slice(0, 10).reverse()}>
                    <XAxis dataKey="timestamp" tickFormatter={v => new Date(v).toLocaleTimeString("el-GR")} fontSize={10} />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                    <Line type="monotone" dataKey="fuelPressure" stroke="#e91e63" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        ) : (
          <div>Δεν βρέθηκαν καταγραφές για το όχημα.</div>
        )}
      </div>
    </div>
  );
}
