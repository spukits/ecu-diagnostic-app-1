const elmRoutes = require('./routes/elm');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const diagnosticsHandler = require('./routes/cars');
const historyRoutes = require('./routes/history');
const auth = require('./Middleware/auth'); // path με βάση τα δικά σου folders

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes); // Login/Register: NO AUTH middleware
app.use('/api/profile', auth, profileRoutes); // Protected
app.use('/api/car-diagnostics', auth, diagnosticsHandler); // Protected
app.use('/api/car-diagnostics', auth, historyRoutes); // Protected
app.use('/api/elm', elmRoutes);


app.get('/', (req, res) => {
  res.send('🚗 ECU Diagnostic App Backend is running!');
});

const MONGO_URI = 'mongodb+srv://ecuuser:ecuuser1234@cluster0.tqlpq99.mongodb.net/ecu-database?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });






