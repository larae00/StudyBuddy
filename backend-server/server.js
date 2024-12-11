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
  const { benutzername, email, passwort, vorname, nachname, profilbild } = req.body;

  if (!benutzername || !email || !passwort || !vorname || !nachname) {
    return res.status(400).json({ error: 'Alle Felder müssen ausgefüllt werden' });
  }

  try {
    // Transaktion starten
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Passwort hashen
      const saltRounds = 10;
      const passwortHash = await bcrypt.hash(passwort, saltRounds);

      // Benutzer einfügen
      const userResult = await client.query(
        'INSERT INTO benutzer (Benutzername, Email, PasswortHash, Vorname, Nachname, ProfilbildSpeicherort) VALUES ($1, $2, $3, $4, $5, $6) RETURNING PK_Benutzer_ID, Benutzername, Email, Vorname, Nachname, ProfilbildSpeicherort',
        [benutzername, email, passwortHash, vorname, nachname, profilbild]
      );

      // Alle Gruppen-IDs abrufen
      const gruppenResult = await client.query('SELECT PK_Gruppe_ID FROM gruppe');
      
      // Benutzer zu allen Gruppen hinzufügen
      for (const gruppe of gruppenResult.rows) {
        await client.query(
          'INSERT INTO benutzer_gruppe (PK_FK_Benutzer_ID, PK_FK_Gruppe_ID) VALUES ($1, $2)',
          [userResult.rows[0].pk_benutzer_id, gruppe.pk_gruppe_id]
        );
      }

      await client.query('COMMIT');
      
      res.status(201).json({
        message: 'Benutzer erfolgreich registriert und allen Gruppen hinzugefügt',
        user: {
          id: userResult.rows[0].pk_benutzer_id,
          benutzername: userResult.rows[0].benutzername,
          email: userResult.rows[0].email,
          vorname: userResult.rows[0].vorname,
          nachname: userResult.rows[0].nachname,
          profilbildSpeicherort: userResult.rows[0].profilbildspeicherort
        }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
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
        Nachname as nachname,
        ProfilbildSpeicherort as profilbildspeicherort
      FROM benutzer 
      WHERE Benutzername = $1`,
      [benutzername]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
    }

    const user = result.rows[0];

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
        nachname: user.nachname,
        profilbildSpeicherort: user.profilbildspeicherort
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

// GET: Alle Gruppen abrufen
app.get('/api/gruppen', async (req, res) => {
  try {
    const result = await pool.query('SELECT PK_Gruppe_ID, Bezeichnung FROM gruppe');
    res.json(result.rows);
  } catch (error) {
    console.error('Fehler beim Abrufen der Gruppen:', error);
    res.status(500).json({ error: 'Serverfehler beim Abrufen der Gruppen' });
  }
});

// GET: Chat messages for a specific group
app.get('/api/chat/:gruppeId', async (req, res) => {
  try {
    const { gruppeId } = req.params;
    const result = await pool.query(`
      SELECT 
        n.PK_Nachricht_ID,
        n.Inhalt,
        n.Timestamp,
        b.Benutzername,
        b.PK_Benutzer_ID
      FROM nachricht n
      JOIN benutzer b ON n.benutzer_id = b.PK_Benutzer_ID
      JOIN chat c ON n.chat_id = c.PK_Chat_ID
      WHERE c.PK_Chat_ID = $1
      ORDER BY n.Timestamp ASC
    `, [gruppeId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Fehler beim Abrufen der Nachrichten:', error);
    res.status(500).json({ error: 'Serverfehler beim Abrufen der Nachrichten' });
  }
});

// POST: New chat message
app.post('/api/chat/:gruppeId/message', async (req, res) => {
  try {
    const { gruppeId } = req.params;
    const { inhalt, benutzerId } = req.body;
    
    const result = await pool.query(`
      INSERT INTO nachricht (Inhalt, chat_id, benutzer_id)
      VALUES ($1, $2, $3)
      RETURNING PK_Nachricht_ID, Inhalt, Timestamp
    `, [inhalt, gruppeId, benutzerId]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Fehler beim Speichern der Nachricht:', error);
    res.status(500).json({ error: 'Serverfehler beim Speichern der Nachricht' });
  }
});

// DELETE: Delete a chat message
app.delete('/api/chat/message/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { benutzerId } = req.query;

    // Überprüfe, ob die Nachricht dem Benutzer gehört
    const checkResult = await pool.query(
      'SELECT benutzer_id FROM nachricht WHERE PK_Nachricht_ID = $1',
      [messageId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Nachricht nicht gefunden' });
    }

    if (checkResult.rows[0].benutzer_id !== parseInt(benutzerId)) {
      return res.status(403).json({ error: 'Keine Berechtigung zum Löschen dieser Nachricht' });
    }

    await pool.query('DELETE FROM nachricht WHERE PK_Nachricht_ID = $1', [messageId]);
    
    res.status(200).json({ message: 'Nachricht erfolgreich gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen der Nachricht:', error);
    res.status(500).json({ error: 'Serverfehler beim Löschen der Nachricht' });
  }
});

// Server starten
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});