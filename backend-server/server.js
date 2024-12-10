const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

// Express-App erstellen
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// PostgreSQL-Konfiguration
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'studybuddy',
  password: 'Studybuddy',
  port: 5432,
});

// Testverbindung zur Datenbank
pool.connect((err, client, done) => {
  if (err) {
    console.error('Fehler bei der Datenbankverbindung:', err);
  } else {
    console.log('Erfolgreich mit der Datenbank verbunden');
    done();
  }
});

// POST: Benutzer registrieren
app.post('/api/register', async (req, res) => {
  const { benutzername, email, passwort, vorname, nachname } = req.body;

  if (!benutzername || !email || !passwort || !vorname || !nachname) {
    return res.status(400).json({ error: 'Alle Felder müssen ausgefüllt werden' });
  }

  try {
    // Passwort hashen
    const saltRounds = 10;
    const passwortHash = await bcrypt.hash(passwort, saltRounds);

    const result = await pool.query(
      'INSERT INTO benutzer (Benutzername, Email, PasswortHash, Vorname, Nachname) VALUES ($1, $2, $3, $4, $5) RETURNING PK_Benutzer_ID, Benutzername, Email, Vorname, Nachname',
      [benutzername, email, passwortHash, vorname, nachname]
    );

    res.status(201).json({
      message: 'Benutzer erfolgreich registriert',
      user: result.rows[0]
    });
  } catch (error) {
    if (error.constraint === 'benutzer_benutzername_key') {
      return res.status(400).json({ error: 'Benutzername bereits vergeben' });
    }
    if (error.constraint === 'benutzer_email_key') {
      return res.status(400).json({ error: 'Email bereits registriert' });
    }
    console.error('Fehler bei der Registrierung:', error);
    res.status(500).json({ error: 'Serverfehler bei der Registrierung' });
  }
});

// POST: Benutzer einloggen
app.post('/api/login', async (req, res) => {
  const { benutzername, passwort } = req.body;

  if (!benutzername || !passwort) {
    return res.status(400).json({ error: 'Benutzername und Passwort sind erforderlich' });
  }

  try {
    const result = await pool.query(
      `SELECT 
        PK_Benutzer_ID as pk_benutzer_id,
        Benutzername as benutzername,
        Email as email,
        PasswortHash as passworthash,
        Vorname as vorname,
        Nachname as nachname
      FROM benutzer 
      WHERE Benutzername = $1`,
      [benutzername]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
    }

    const user = result.rows[0];
    console.log('Gefundener Benutzer:', user);
    console.log('Eingegebenes Passwort:', passwort);
    console.log('Gespeicherter PasswortHash:', user.passworthash);

    // Prüfen ob der Hash überhaupt existiert
    if (!user.passworthash) {
      console.error('Kein PasswortHash in der Datenbank gefunden');
      return res.status(500).json({ error: 'Interner Serverfehler' });
    }

    const passwortKorrekt = await bcrypt.compare(passwort, user.passworthash);

    if (!passwortKorrekt) {
      return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
    }

    // Erfolgreicher Login
    res.status(200).json({
      message: 'Login erfolgreich',
      user: {
        id: user.pk_benutzer_id,
        benutzername: user.benutzername,
        email: user.email,
        vorname: user.vorname,
        nachname: user.nachname
      }
    });
  } catch (error) {
    console.error('Fehler beim Login:', error);
    console.error('Fehlerdetails:', {
      passwort: !!passwort,
      userExists: !!user,
      hashExists: user && !!user.passworthash
    });
    res.status(500).json({ error: 'Serverfehler beim Login' });
  }
});

// Server starten
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});