const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json());

const uri = 'mongodb+srv://ecuuser:ecuuser1234@cluster0.tqlpq99.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri);

const port = 4000;

app.post('/api/car-diagnostics', async (req, res) => {
  try {
    const data = req.body;
    const db = client.db('ecu-database');
    const collection = db.collection('diagnostics');
    const result = await collection.insertOne(data);
    res.status(201).json({ message: 'Data saved!', id: result.insertedId });
  } catch (error) {
    console.error('❌ Error saving data:', error);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

app.get('/api/car-diagnostics/history', async (req, res) => {
  try {
    const db = client.db('ecu-database');
    const collection = db.collection('diagnostics');
    const history = await collection.find({}).toArray();
    res.json(history);
  } catch (error) {
    console.error('❌ Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

app.get('/', (req, res) => {
  res.send('🚗 ECU Diagnostic App is running!');
});

client.connect()
  .then(() => {
    console.log('✅ MongoDB Connected!');
    app.listen(port, () => {
      console.log(`🚀 Server is running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err);
  });
