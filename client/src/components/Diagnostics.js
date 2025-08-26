import React, { useState, useEffect } from 'react';

function CarDiagnostics() {
  const [diagnostics, setDiagnostics] = useState([]);
  const [loading, setLoading] = useState(true);

  // Headers με token!
  const getHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": "Bearer " + localStorage.getItem("token"),
  });

  useEffect(() => {
    fetch('/api/car-diagnostics/history', { headers: getHeaders() })
      .then((response) => response.json())
      .then((data) => {
        setDiagnostics(data.reverse());
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching diagnostics:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Φόρτωση διαγνωστικών...</div>;
  }

  if (!diagnostics.length) {
    return <div>Δεν βρέθηκαν διαγνωστικά δεδομένα.</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Καταγραφές Οχήματος</h2>
      {diagnostics.map((entry, index) => (
        <div key={index} style={{
          border: '1px solid gray',
          borderRadius: '10px',
          padding: '15px',
          marginBottom: '15px',
          backgroundColor: '#f9f9f9'
        }}>
          <h3>{entry.vin} 🚗</h3>
          <p><strong>Ημερομηνία:</strong> {new Date(entry.timestamp).toLocaleString("el-GR")}</p>
          <p><strong>RPM:</strong> {entry.rpm}</p>
          <p><strong>Ταχύτητα:</strong> {entry.speed} km/h</p>
          <p><strong>Θερμοκρασία Κινητήρα:</strong> {entry.engineTemp}°C</p>
          <p><strong>Θέση Πεταλούδας:</strong> {entry.throttle}%</p>
          <p><strong>Φορτίο Κινητήρα:</strong> {entry.engineLoad}%</p>
          <p>
            <strong>Check Engine:</strong>{" "}
            {entry.milStatus ? <span style={{ color: "red" }}>ON</span> : <span style={{ color: "green" }}>OFF</span>}
          </p>
          <p>
            <strong>DTCs:</strong>{" "}
            {entry.dtcs && entry.dtcs.length
              ? entry.dtcs.join(", ")
              : "Καμία"}
          </p>
        </div>
      ))}
    </div>
  );
}

export default CarDiagnostics;
