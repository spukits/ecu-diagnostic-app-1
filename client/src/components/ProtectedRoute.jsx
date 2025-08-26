import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  // Αν ΔΕΝ υπάρχει token, ανακατεύθυνση στο login
  return token ? children : <Navigate to="/login" />;
}
