router.get('/read', async (req, res) => {
  if (!elmPort || !elmPort.isOpen) {
    return res.status(400).json({ message: "Δεν υπάρχει ενεργή σύνδεση ELM327." });
  }
  try {
    // Ζήτα όλα τα PID ένα-ένα (δεν υποστηρίζουν όλα τα ELM327 πολλά μαζί)
    const commands = [
      { key: "rpm", cmd: "010C" },
      { key: "speed", cmd: "010D" },
      { key: "engineTemp", cmd: "0105" },
      { key: "intakeAirTemp", cmd: "010F" },
      { key: "fuelLevel", cmd: "012F" },
      { key: "throttle", cmd: "0111" },
      { key: "engineLoad", cmd: "0104" },
      { key: "fuelPressure", cmd: "010A" },
      { key: "intakePressure", cmd: "010B" },
      { key: "engineRuntime", cmd: "011F" },
    ];

    let results = {};
    for (const { key, cmd } of commands) {
      await new Promise((resolve, reject) => {
        elmPort.write(cmd + "\r");
        elmPort.once("data", (data) => {
          const hex = data.toString().trim().split(" ");
          // Ανάλογα με το PID κάνε parsing τα bytes:
          if (key === "rpm" && hex.length >= 4) {
            const A = parseInt(hex[2], 16);
            const B = parseInt(hex[3], 16);
            results[key] = ((A * 256) + B) / 4;
          } else if (key === "speed" && hex.length >= 3) {
            results[key] = parseInt(hex[2], 16);
          } else if (key === "engineTemp" && hex.length >= 3) {
            results[key] = parseInt(hex[2], 16) - 40;
          } else if (key === "intakeAirTemp" && hex.length >= 3) {
            results[key] = parseInt(hex[2], 16) - 40;
          } else if (key === "fuelLevel" && hex.length >= 3) {
            results[key] = Math.round((parseInt(hex[2], 16) * 100) / 255);
          } else if (key === "throttle" && hex.length >= 3) {
            results[key] = Math.round((parseInt(hex[2], 16) * 100) / 255);
          } else if (key === "engineLoad" && hex.length >= 3) {
            results[key] = Math.round((parseInt(hex[2], 16) * 100) / 255);
          } else if (key === "fuelPressure" && hex.length >= 3) {
            results[key] = parseInt(hex[2], 16) * 3; // σύμφωνα με OBD-II spec
          } else if (key === "intakePressure" && hex.length >= 3) {
            results[key] = parseInt(hex[2], 16);
          } else if (key === "engineRuntime" && hex.length >= 4) {
            results[key] = (parseInt(hex[2], 16) * 256) + parseInt(hex[3], 16);
          }
          resolve();
        });
      });
      await new Promise(r => setTimeout(r, 60)); // λίγο delay ανάμεσα στα cmd
    }

    res.json(results);

  } catch (err) {
    res.status(500).json({ message: "Σφάλμα στη λήψη δεδομένων!", error: err });
  }
});
