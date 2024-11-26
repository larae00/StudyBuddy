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
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f9;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 500px;
            margin: 50px auto;
            padding: 20px;
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        h1 {
            text-align: center;
        }
        form {
            display: flex;
            flex-direction: column;
        }
        input[type="text"], input[type="email"], input[type="password"] {
            padding: 10px;
            margin-bottom: 15px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        button {
            padding: 10px;
            background-color: #007bff;
            color: #fff;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        button:hover {
            background-color: #0056b3;
        }
        .error {
            color: #d9534f;
            margin-bottom: 15px;
        }
        .success {
            color: #5cb85c;
            margin-bottom: 15px;
        }
        .links {
            text-align: center;
            margin-top: 15px;
        }
        .links a {
            color: #007bff;
            text-decoration: none;
        }
        .links a:hover {
            text-decoration: underline;
        }
    </style>
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
