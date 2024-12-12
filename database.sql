create database studybuddy;


CREATE TABLE benutzer (
    PK_Benutzer_ID SERIAL PRIMARY KEY,
    Benutzername VARCHAR(30) UNIQUE NOT NULL,
    Email VARCHAR(255) UNIQUE NOT NULL,
    PasswortHash VARCHAR(255) NOT NULL,
    Vorname VARCHAR(255) NOT NULL,
    Nachname VARCHAR(255) NOT NULL,
    ProfilbildSpeicherort TEXT
);

CREATE TABLE gruppe (
    PK_Gruppe_ID SERIAL PRIMARY KEY,
    Bezeichnung VARCHAR(255) NOT NULL
);

CREATE TABLE benutzer_gruppe (
    PK_FK_Benutzer_ID INT,
    PK_FK_Gruppe_ID INT,
    PRIMARY KEY (PK_FK_Benutzer_ID, PK_FK_Gruppe_ID),
    FOREIGN KEY (PK_FK_Benutzer_ID) REFERENCES benutzer(PK_Benutzer_ID),
    FOREIGN KEY (PK_FK_Gruppe_ID) REFERENCES gruppe(PK_Gruppe_ID)
);

CREATE TABLE chat (
    PK_Chat_ID SERIAL PRIMARY KEY,
    Bezeichnung VARCHAR(255) NOT NULL,
    FOREIGN KEY (PK_Chat_ID) REFERENCES gruppe(PK_Gruppe_ID)
);

CREATE TABLE nachricht (
    PK_Nachricht_ID SERIAL PRIMARY KEY,
    Inhalt VARCHAR(255) NOT NULL,
    Timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    chat_id INT,
    benutzer_id INT,
    FOREIGN KEY (chat_id) REFERENCES chat(PK_Chat_ID),
    FOREIGN KEY (benutzer_id) REFERENCES benutzer(PK_Benutzer_ID)
);

CREATE TABLE dokument (
    PK_Dokument_ID SERIAL PRIMARY KEY,
    Bezeichnung VARCHAR(255) NOT NULL,
     DateiInhalt TEXT NOT NULL,
    FOREIGN KEY (PK_Dokument_ID) REFERENCES nachricht(PK_Nachricht_ID)
);

-- Einfügen von Gruppe-Daten
WITH inserted_gruppen AS (
    INSERT INTO gruppe (Bezeichnung)
    VALUES
    ('Allgemein'),
    ('SEW'),
    ('Mathematik'),
    ('Deutsch'),
    ('Englisch')
    RETURNING PK_Gruppe_ID, Bezeichnung
)
-- Einfügen der Chat-Daten, mit Bezug auf die PK_Gruppe_IDs
INSERT INTO chat (PK_Chat_ID, Bezeichnung)
SELECT PK_Gruppe_ID, Bezeichnung || ' Chat'
FROM inserted_gruppen;
-- in postgres



