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

// Formularverarbeitung
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $benutzername = $_POST['benutzername'] ?? '';
    $passwort = $_POST['passwort'] ?? '';

    if (empty($benutzername) || empty($passwort)) {
        $error = 'Benutzername und Passwort müssen angegeben werden.';
    } else {
        // Benutzer überprüfen
        $sql = "SELECT PK_Benutzer_ID, PasswortHash FROM benutzer WHERE Benutzername = :benutzername";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':benutzername' => $benutzername]);

        if ($stmt->rowCount() === 1) {
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            if (password_verify($passwort, $user['PasswortHash'])) {
                // Login erfolgreich
                session_start();
                $_SESSION['benutzer_id'] = $user['PK_Benutzer_ID'];
                $_SESSION['benutzername'] = $benutzername;

                // Weiterleitung zur Hauptseite
                header('Location: hauptseite.php');
                exit;
            } else {
                $error = 'Falsches Passwort.';
            }
        } else {
            $error = 'Benutzername nicht gefunden.';
        }
    }
}
?>

<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - StudyBuddy</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>Login</h1>
        <?php if ($error): ?>
            <p class="error"><?= htmlspecialchars($error) ?></p>
        <?php endif; ?>
        <form method="post" action="">
            <input type="text" name="benutzername" placeholder="Benutzername" required>
            <input type="password" name="passwort" placeholder="Passwort" required>
            <button type="submit">Einloggen</button>
        </form>

        <div class="links">
            <p>Noch keinen Account? <a href="register.php">Jetzt registrieren</a></p>
        </div>
    </div>
</body>
</html>
