// src/pages/Home.jsx
import { Link, useNavigate } from "react-router-dom";
import { useCallback } from "react";

const categories = [
  { title: "Dashboard",    path: "/dashboard",   icon: "📊", desc: "Σύνοψη τελευταίων μετρήσεων" },
  { title: "Live Data",    path: "/live",        icon: "🛰️", desc: "Ζωντανά OBD-II δεδομένα" },
  { title: "Diagnostics",  path: "/diagnostics", icon: "🛠️", desc: "DTCs & έλεγχοι" },
  { title: "History",      path: "/history",     icon: "🗂️", desc: "Αποθηκευμένες καταγραφές" },
  { title: "Export",       path: "/export",      icon: "📤", desc: "Εξαγωγή σε CSV / PDF" },
  { title: "Settings",     path: "/settings",    icon: "⚙️", desc: "Θέμα, brand color, προτιμήσεις" }, // ✅ επανήλθε εδώ
];

export default function Home() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");
  const username = localStorage.getItem("username") || "Χρήστη";

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    navigate("/login");
  }, [navigate]);

  return (
    <div className="page-wrap">
      {/* Καλωσόρισμα */}
      <div className="card mb-6">
        <h1 className="title">Καλώς ήρθες, {username}!</h1>
        <p className="muted mt-2">
          ECU Diagnostic App — παρακολούθηση, ιστορικό και εξαγωγές OBD-II.
        </p>
      </div>

      {/* Αν δεν υπάρχει token, CTA για Σύνδεση/Εγγραφή */}
      {!isLoggedIn && (
        <div className="grid gap-4 md:grid-cols-2 mb-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-2">Ξεκίνα</h2>
            <p className="muted mb-4">
              Συνδέσου ή δημιούργησε λογαριασμό για να δεις τα δεδομένα σου.
            </p>
            <div className="flex gap-2">
              <Link to="/login" className="btn">Σύνδεση</Link>
              <Link to="/register" className="btn">Εγγραφή</Link>
            </div>
          </div>
          <div className="card">
            <h2 className="text-xl font-semibold mb-2">Τι προσφέρει</h2>
            <ul className="list-disc list-inside muted space-y-1">
              <li>Ζωντανή ροή OBD-II (RPM, ταχύτητα, θερμοκρασίες κ.ά.)</li>
              <li>Ιστορικό καταγραφών & mini-charts</li>
              <li>Εξαγωγές CSV / PDF</li>
            </ul>
          </div>
        </div>
      )}

      {/* Tiles σελίδων (αν είσαι συνδεδεμένος είναι links, αλλιώς disabled) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) =>
          isLoggedIn ? (
            <Link key={cat.path} to={cat.path} className="card hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{cat.title}</h3>
                <span className="text-2xl" aria-hidden>{cat.icon}</span>
              </div>
              <p className="muted mt-2">{cat.desc}</p>
              <div className="mt-4">
                <span className="btn">Μετάβαση</span>
              </div>
            </Link>
          ) : (
            <div
              key={cat.path}
              className="card opacity-60 cursor-not-allowed"
              title="Απαιτείται σύνδεση"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{cat.title}</h3>
                <span className="text-2xl" aria-hidden>{cat.icon}</span>
              </div>
              <p className="muted mt-2">{cat.desc}</p>
              <div className="mt-4">
                <span className="btn">Κλειδωμένο</span>
              </div>
            </div>
          )
        )}
      </div>

      {/* (Προαιρετικό) κουμπί αποσύνδεσης */}
      {/* {isLoggedIn && (
        <div className="mt-6">
          <button onClick={handleLogout} className="btn">Αποσύνδεση</button>
        </div>
      )} */}
    </div>
  );
}
