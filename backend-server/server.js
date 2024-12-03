const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

// PostgreSQL-Konfiguration
const dbConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'studybuddy',
  password: 'Studybuddy',
  port: 5432,
};

const pool = new Pool(dbConfig);
const app = express();

// Middleware
app.use(cors()); // CORS für alle Ursprünge aktivieren
app.use(bodyParser.json());

// Test-Route
app.get('/', (req, res) => {
  res.send('API läuft!');
});

// GET: Alle Benutzer abrufen
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Fehler beim Abrufen der Benutzer:', error);
    res.status(500).send('Serverfehler');
  }
});

// POST: Neuen Benutzer hinzufügen
app.post('/api/users', async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).send('Name und Email sind erforderlich!');
  }

  try {
    const result = await pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Fehler beim Hinzufügen eines Benutzers:', error);
    res.status(500).send('Serverfehler');
  }
});

// Server starten
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
