import { Link, useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

// Οι βασικές κατηγορίες/σελίδες που εμφανίζονται στο home με εικονίδια
const categories = [
  { name: "Dashboard", path: "/dashboard", icon: "📊" },
  { name: "Live Δεδομένα", path: "/live", icon: "📈" },
  { name: "Διαγνωστικά", path: "/diagnostics", icon: "🔧" },
  { name: "Ιστορικό", path: "/history", icon: "📚" },
  { name: "Εξαγωγή Δεδομένων", path: "/export", icon: "📤" },
  { name: "Ρυθμίσεις", path: "/settings", icon: "⚙️" },
];

export default function Home() {
  const navigate = useNavigate();

  // Συνάρτηση αποσύνδεσης: Καθαρίζει τα δεδομένα του χρήστη και τον επιστρέφει στη σελίδα login
  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    navigate("/login");
  }, [navigate]);

  // Ελέγχουμε αν υπάρχει συνδεδεμένος χρήστης (token)
  const isLoggedIn = !!localStorage.getItem("token");
  const username = localStorage.getItem("username");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 space-y-6">
      {/* Κεντρικό grid με τα διαθέσιμα "κουτιά" - μενού */}
      <div className="grid grid-cols-2 gap-4 max-w-lg w-full">
        {categories.map((cat, i) => (
          isLoggedIn ? (
            // Αν ο χρήστης είναι συνδεδεμένος, τα κουτιά είναι clickable και οδηγούν στη σελίδα τους
            <Link
              key={i}
              to={cat.path}
              className="bg-white shadow-md hover:shadow-xl transition duration-200 p-4 rounded-lg text-center"
            >
              <div className="text-4xl">{cat.icon}</div>
              <div className="mt-2 text-sm font-semibold">{cat.name}</div>
            </Link>
          ) : (
            // Αν ΔΕΝ είναι συνδεδεμένος, τα κουτιά φαίνονται γκρι και δεν πατιούνται
            <div
              key={i}
              className="bg-gray-200 shadow p-4 rounded-lg text-center opacity-50 cursor-not-allowed"
              title="Συνδέσου για να έχεις πρόσβαση"
            >
              <div className="text-4xl">{cat.icon}</div>
              <div className="mt-2 text-sm font-semibold">{cat.name}</div>
            </div>
          )
        ))}
      </div>

      {/* Εμφανίζει μήνυμα χαιρετισμού αν υπάρχει username */}
      {isLoggedIn && username && (
        <div className="mt-6 text-gray-700 text-md">
          Καλωσήρθες, <b>{username}</b>
        </div>
      )}

      {/* Αν δεν είναι συνδεδεμένος, δείχνει επιλογές για login/register */}
      {!isLoggedIn && (
        <div className="flex space-x-6 mt-6">
          <Link
            to="/login"
            className="px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700 transition"
          >
            Σύνδεση
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 rounded text-white bg-green-600 hover:bg-green-700 transition"
          >
            Εγγραφή
          </Link>
        </div>
      )}

      {/* Προαιρετικά: Κουμπί αποσύνδεσης μόνο αν θες να το έχεις και εδώ κάτω (συνήθως μόνο στο navbar) */}
      {/* {isLoggedIn && (
        <button
          onClick={handleLogout}
          className="mt-4 px-4 py-2 rounded text-white bg-red-600 hover:bg-red-700 transition"
        >
          Αποσύνδεση
        </button>
      )} */}
    </div>
  );
}
