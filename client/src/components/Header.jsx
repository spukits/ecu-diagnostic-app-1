import { useLocation, useNavigate } from "react-router-dom";

export default function Header() {
  const username = localStorage.getItem("username");
  const location = useLocation();
  const navigate = useNavigate();

  // Ελέγχουμε αν είμαστε ήδη στη home (υποστήριξη για "/" και "/home")
  const isHome =
    location.pathname === "/" ||
    location.pathname === "/home";

  return (
    <header className="w-full bg-white shadow flex items-center justify-between px-4 py-2 mb-6">
      {/* Αριστερά το logo/όνομα της εφαρμογής */}
      <span className="font-bold text-blue-700 text-lg">ECU Diagnostic App</span>
      
      {/* Δεξιά τα στοιχεία του χρήστη */}
      {username && (
        <div className="flex items-center gap-4">
          {/* Όνομα χρήστη */}
          <span>👤 {username}</span>

          {/* Κουμπί Home - δεν φαίνεται αν είμαστε ήδη στην αρχική */}
          {!isHome && (
            <button
              onClick={() => navigate("/")}
              className="bg-gray-200 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition"
            >
              Home
            </button>
          )}

          {/* Κουμπί αποσύνδεσης */}
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
          >
            Αποσύνδεση
          </button>
        </div>
      )}
    </header>
  );
}
