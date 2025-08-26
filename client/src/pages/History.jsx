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
import { saveAs } from "file-saver";
import jsPDF from "jspdf";

export default function History() {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Παίρνω τα headers με το JWT token για κάθε request προς το backend
  const getHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": "Bearer " + localStorage.getItem("token"),
  });

  // Φόρτωση όλου του ιστορικού με το που ανοίγει η σελίδα
  useEffect(() => {
    fetch("/api/car-diagnostics/history", {
      headers: getHeaders(),
    })
      .then((res) => res.json())
      // Φέρνω το πιο πρόσφατο πρώτο (αντίστροφη σειρά)
      .then((data) => setHistory(data.reverse()))
      .catch((err) => console.error("Σφάλμα ιστορικού:", err));
    // eslint-disable-next-line
  }, []);

  // Διαγραφή μίας καταγραφής
  const deleteOne = async (id) => {
    if (!window.confirm("Είσαι σίγουρος ότι θέλεις να διαγράψεις αυτή την καταγραφή;")) return;
    try {
      const res = await fetch(`/api/car-diagnostics/history/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (res.ok) {
        setHistory((prev) => prev.filter((item) => item._id !== id));
      }
    } catch (err) {
      console.error("Σφάλμα διαγραφής εγγραφής:", err);
    }
  };

  // Φιλτράρισμα ιστορικού με βάση VIN & ημερομηνία
  const filteredHistory = history.filter((car) => {
    const matchesSearch = (car?.vin || "")
      .toLowerCase()
      .includes((search || "").toLowerCase());
    const matchesDate = dateFilter
      ? new Date(car.timestamp).toISOString().slice(0, 10) === dateFilter
      : true;
    return matchesSearch && matchesDate;
  });

  // Για εξαγωγή CSV/PDF αν τα ξαναχρειαστείς
  const exportCSV = () => {
    const headers = Object.keys(history[0] || {}).join(",");
    const rows = history.map((item) => Object.values(item).join(",")).join("\n");
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "history.csv");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    history.forEach((car, i) => {
      let top = 10 + i * 80;
      if (top > 270) {
        doc.addPage();
        top = 10;
      }
      doc.setFontSize(10);
      doc.text(`VIN: ${car.vin}`, 10, top);
      doc.text(
        `Χρόνος: ${new Date(car.timestamp).toLocaleString()}`,
        10,
        top + 5
      );
      doc.text(
        `RPM: ${car.rpm} | Speed: ${car.speed} km/h | Temp: ${car.engineTemp}°C`,
        10,
        top + 10
      );
      doc.text(
        `Fuel: ${car.fuelLevel}% | Fuel Pressure: ${car.fuelPressure} kPa`,
        10,
        top + 15
      );
      doc.text(
        `Throttle: ${car.throttle}% | Load: ${car.engineLoad}%`,
        10,
        top + 20
      );
    });
    doc.save("history.pdf");
  };

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold text-center text-gray-800">
        📚 Ιστορικό Καταγραφών Οχήματος
      </h2>

      {/* Αναζήτηση και φίλτρα */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <input
          type="text"
          placeholder="Αναζήτηση VIN..."
          className="border px-3 py-2 rounded w-full md:w-1/2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          type="date"
          className="border px-3 py-2 rounded w-full md:w-1/3"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />
      </div>

      {/* Μήνυμα αν δεν υπάρχουν καταγραφές */}
      {filteredHistory.length === 0 ? (
        <p className="text-center text-gray-600">
          Δεν υπάρχουν καταγραφές για τα φίλτρα που δώσατε.
        </p>
      ) : (
        [...filteredHistory].reverse().map((car, index) => (
          <div
            key={index}
            className="p-6 bg-white rounded-lg shadow-md border border-gray-200 space-y-3"
          >
            {/* Πάνω μέρος: VIN και κουμπί διαγραφής */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <div>
                <p className="text-lg font-semibold">VIN: {car.vin}</p>
                <p className="text-sm text-gray-500">
                  Καταγραφή: {new Date(car.timestamp).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => deleteOne(car._id)}
                className="mt-2 md:mt-0 bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded"
              >
                Διαγραφή
              </button>
            </div>

            {/* Πληροφορίες αυτοκινήτου */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700">
              <p>
                <strong>RPM:</strong> {car.rpm}
              </p>
              <p>
                <strong>Ταχύτητα:</strong> {car.speed} km/h
              </p>
              <p>
                <strong>Θερμοκρασία Κινητήρα:</strong> {car.engineTemp}°C
              </p>
              <p>
                <strong>Καύσιμο:</strong> {car.fuelLevel}%
              </p>
              <p>
                <strong>Θέση Πεταλούδας:</strong> {car.throttle}%
              </p>
              <p>
                <strong>Φορτίο Κινητήρα:</strong> {car.engineLoad}%
              </p>
              <p>
                <strong>Πίεση Εισαγωγής:</strong> {car.intakePressure} kPa
              </p>
              <p>
                <strong>Θερμοκρασία Αέρα:</strong> {car.intakeAirTemp}°C
              </p>
              <p>
                <strong>Runtime:</strong> {car.engineRuntime} sec
              </p>
              <p>
                <strong>Πίεση Καυσίμου:</strong> {car.fuelPressure} kPa
              </p>
              <p>
                <strong>Check Engine:</strong> {car.milStatus ? "ON" : "OFF"}
              </p>
              <p>
                <strong>DTCs:</strong>{" "}
                {car.dtcs?.length ? car.dtcs.join(", ") : "Καμία"}
              </p>
            </div>

            {/* Τα 4 γραφήματα κάθε φορά για κάθε εγγραφή */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="h-36">
                <h4 className="text-sm font-medium text-gray-600 mb-1">📈 RPM</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[car]}>
                    <XAxis dataKey="timestamp" hide />
                    <YAxis />
                    <Tooltip />
                    <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                    <Line
                      type="monotone"
                      dataKey="rpm"
                      stroke="#8884d8"
                      dot
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="h-36">
                <h4 className="text-sm font-medium text-gray-600 mb-1">
                  🚗 Ταχύτητα
                </h4>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[car]}>
                    <XAxis dataKey="timestamp" hide />
                    <YAxis />
                    <Tooltip />
                    <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                    <Line
                      type="monotone"
                      dataKey="speed"
                      stroke="#82ca9d"
                      dot
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="h-36">
                <h4 className="text-sm font-medium text-gray-600 mb-1">
                  🌡️ Θερμοκρασία
                </h4>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[car]}>
                    <XAxis dataKey="timestamp" hide />
                    <YAxis />
                    <Tooltip />
                    <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                    <Line
                      type="monotone"
                      dataKey="engineTemp"
                      stroke="#ff7300"
                      dot
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="h-36">
                <h4 className="text-sm font-medium text-gray-600 mb-1">
                  ⛽ Πίεση Καυσίμου
                </h4>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[car]}>
                    <XAxis dataKey="timestamp" hide />
                    <YAxis />
                    <Tooltip />
                    <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                    <Line
                      type="monotone"
                      dataKey="fuelPressure"
                      stroke="#00c49f"
                      dot
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
