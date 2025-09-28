// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Εγγραφή επιτυχής!"); // Registration successful
        setTimeout(() => navigate("/login"), 1200);
      } else {
        setMessage(`❌ Σφάλμα: ${data.message || "Αποτυχία εγγραφής."}`);
      }
    } catch {
      setMessage("❌ Σφάλμα διακομιστή. Προσπαθήστε ξανά.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-10 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Εγγραφή Χρήστη
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="username"
          value={form.username}
          onChange={handleChange}
          placeholder="Όνομα χρήστη"
          className="border p-2 rounded w-full"
          required
        />
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
          Εγγραφή
        </button>
      </form>

      {message && (
        <div className="mt-4 text-center text-sm font-semibold">{message}</div>
      )}
    </div>
  );
}

