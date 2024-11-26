<?php
// Datenbankverbindung herstellen
$dsn = 'mysql:host=localhost;dbname=studybuddy;charset=utf8mb4';
$username = 'root'; // Ersetze mit deinem DB-Benutzernamen
$password = ''; // Ersetze mit deinem DB-Passwort

try {
    $pdo = new PDO($dsn, $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Datenbankverbindung fehlgeschlagen: " . $e->getMessage());
}

// Variablen initialisieren
$error = '';
$success = '';

// Formularverarbeitung
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $benutzername = $_POST['benutzername'] ?? '';
    $email = $_POST['email'] ?? '';
    $passwort = $_POST['passwort'] ?? '';
    $vorname = $_POST['vorname'] ?? '';
    $nachname = $_POST['nachname'] ?? '';

    // Validierung
    if (empty($benutzername) || empty($email) || empty($passwort) || empty($vorname) || empty($nachname)) {
        $error = 'Alle Felder müssen ausgefüllt werden.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
    } else {
        // Passwort-Hashing
        $passwortHash = password_hash($passwort, PASSWORD_DEFAULT);

        // Einfügen in die Datenbank
        try {
            // Benutzer in der Tabelle 'benutzer' einfügen
            $sql = "INSERT INTO benutzer (Benutzername, Email, PasswortHash, Vorname, Nachname) 
                    VALUES (:benutzername, :email, :passwortHash, :vorname, :nachname)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':benutzername' => $benutzername,
                ':email' => $email,
                ':passwortHash' => $passwortHash,
                ':vorname' => $vorname,
                ':nachname' => $nachname,
            ]);

            // Benutzer ID abrufen
            $userId = $pdo->lastInsertId();

            // Alle Gruppen-IDs abrufen
            $sqlGroups = "SELECT PK_Gruppe_ID FROM gruppe";
            $stmtGroups = $pdo->prepare($sqlGroups);
            $stmtGroups->execute();
            $gruppen = $stmtGroups->fetchAll(PDO::FETCH_ASSOC);

            // Benutzer zu jeder Gruppe hinzufügen
            foreach ($gruppen as $gruppe) {
                $sqlGroup = "INSERT INTO benutzer_gruppe (PK_FK_Benutzer_ID, PK_FK_Gruppe_ID) 
                             VALUES (:userId, :gruppeId)";
                $stmtGroup = $pdo->prepare($sqlGroup);
                $stmtGroup->execute([
                    ':userId' => $userId,
                    ':gruppeId' => $gruppe['PK_Gruppe_ID']
                ]);
            }

            // Erfolgreiche Registrierung - Weiterleitung zur Login-Seite
            $success = 'Registrierung erfolgreich! Sie können sich jetzt einloggen.';
            header('refresh:2;url=login.php');  // Weiterleitung nach 2 Sekunden zur Login-Seite
            exit;
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) { // Duplicate entry (Benutzername oder Email bereits vorhanden)
                $error = 'Benutzername oder E-Mail-Adresse ist bereits registriert.';
            } else {
                $error = 'Fehler bei der Registrierung: ' . $e->getMessage();
            }
        }
    }
}
?>

<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registrierung - StudyBuddy</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>Registrierung</h1>
        <?php if ($error): ?>
            <p class="error"><?= htmlspecialchars($error) ?></p>
        <?php endif; ?>
        <?php if ($success): ?>
            <p class="success"><?= htmlspecialchars($success) ?></p>
        <?php endif; ?>
        <form method="post" action="">
            <input type="text" name="benutzername" placeholder="Benutzername" required>
            <input type="email" name="email" placeholder="E-Mail" required>
            <input type="password" name="passwort" placeholder="Passwort" required>
            <input type="text" name="vorname" placeholder="Vorname" required>
            <input type="text" name="nachname" placeholder="Nachname" required>
            <button type="submit">Registrieren</button>
        </form>

        <div class="links">
            <p>Bereits ein Account? <a href="login.php">Jetzt einloggen</a></p>
        </div>
    </div>
</body>
</html>
