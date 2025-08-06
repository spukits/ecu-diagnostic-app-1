import obd
import requests
import time

# 1. Σύνδεση στον OBD reader
print("🔌 Connecting to OBD device...")
connection = obd.OBD()  # Συνδέεται αυτόματα στην πρώτη διαθέσιμη θύρα

if not connection.is_connected():
    print("❌ No OBD device found. Check your adapter and connection!")
    exit()

print("✅ Connected to OBD device.")

# 2. Διαβάζουμε κάποιες βασικές τιμές
def read_data():
    try:
        rpm_response = connection.query(obd.commands.RPM)
        temp_response = connection.query(obd.commands.COOLANT_TEMP)
        speed_response = connection.query(obd.commands.SPEED)
        throttle_response = connection.query(obd.commands.THROTTLE_POS)

        # Αν δεν πάρουμε τιμή από κάποιο command, βάζουμε "N/A"
        rpm = str(rpm_response.value) if rpm_response.value else "N/A"
        temperature = str(temp_response.value) if temp_response.value else "N/A"
        speed = str(speed_response.value) if speed_response.value else "N/A"
        throttle = str(throttle_response.value) if throttle_response.value else "N/A"

        data = {
            "vehicleType": "motorbike",  # ή "car"
            "carModel": "Yamaha MT-07",  # Ή όποιο άλλο όχημα
            "engineStatus": "OK",
            "temperature": temperature,
            "rpm": rpm,
            "speed": speed,
            "throttlePosition": throttle,
            "errorCodes": []  # Θα το αναπτύξουμε αργότερα
        }
        return data

    except Exception as e:
        print(f"❗ Error reading data: {e}")
        return None

# 3. Στέλνουμε δεδομένα στο API
def send_data(data):
    url = "http://localhost:4000/api/car-diagnostics"
    try:
        response = requests.post(url, json=data)
        if response.status_code == 201:
            print("✅ Data sent successfully!")
        else:
            print(f"❌ Failed to send data: {response.status_code}, {response.text}")
    except Exception as e:
        print(f"❗ Error sending data: {e}")

# 4. Εκτέλεση συνεχώς
while True:
    diagnostic_data = read_data()
    if diagnostic_data:
        print("📤 Sending:", diagnostic_data)
        send_data(diagnostic_data)
    else:
        print("⚠️ No data to send.")
    time.sleep(5)
