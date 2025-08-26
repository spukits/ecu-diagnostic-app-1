export default function LogoutButton({ onLogout }) {
  const handleLogout = () => {
    // Καθαρίζει ΟΛΑ τα user στοιχεία από localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    // Αν θες, ή και όλα τα δεδομένα:
    // localStorage.clear();

    if (onLogout) onLogout();
    window.location.href = "/login"; // Ή "/" αν προτιμάς
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-600 text-white rounded px-4 py-2 hover:bg-red-700"
    >
      Αποσύνδεση
    </button>
  );
}
