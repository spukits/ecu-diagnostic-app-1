import React from 'react';

function AddDiagnostic() {
  const handleAdd = () => {
    const newDiagnostic = {
      carModel: "BMW X5",
      engineStatus: "OK",
      batteryStatus: "Good",
      temperature: "75.2 °C",
      oilPressure: "42.0 PSI",
      fuelLevel: "58.3%",
      brakeStatus: "OK",
      odometer: "128500 km",
      errorCodes: ["P0430"]
    };

    fetch('http://localhost:4000/api/car-diagnostics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newDiagnostic),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('✅ Sent:', data);
        alert('🚗 Διαγνωστικά δεδομένα στάλθηκαν επιτυχώς!');
      })
      .catch((err) => {
        console.error('❌ Error sending data:', err);
        alert('⚠️ Σφάλμα κατά την αποστολή');
      });
  };

  return (
    <div>
      <button onClick={handleAdd}>📤 Αποθήκευση Διαγνωστικών</button>
    </div>
  );
}

export default AddDiagnostic;
