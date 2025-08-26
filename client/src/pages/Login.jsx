import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setSuccess(false);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);

        // --- Αποθήκευση username/email ---
        if (data.user) {
          localStorage.setItem("username", data.user.username || "");
          localStorage.setItem("email", data.user.email || "");
        }

        setMessage("✅ Επιτυχής σύνδεση! Μεταφέρεστε στην αρχική σελίδα...");
        setSuccess(true);
        setTimeout(() => navigate("/"), 1200);
      } else {
        setMessage("❌ " + (data.message || "Σφάλμα σύνδεσης"));
      }
    } catch {
      setMessage("❌ Πρόβλημα σύνδεσης με τον server.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-10 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-6 text-center">Σύνδεση Χρήστη</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className="border p-2 rounded w-full"
          required
        />
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Κωδικός"
          className="border p-2 rounded w-full"
          required
        />
        <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Σύνδεση
        </button>
      </form>
      {message && (
        <div
          className={`mt-4 text-center text-sm font-semibold ${
            success ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </div>
      )}
      {/* Κουμπί Εγγραφής κάτω από το κουμπί Σύνδεσης */}
      <div className="mt-4 text-center">
        Δεν έχετε λογαριασμό;{" "}
        <Link to="/register" className="text-blue-600 hover:underline font-semibold">
          Εγγραφή
        </Link>
      </div>
    </div>
  );
}

