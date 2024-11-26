<?php
session_start();

// Überprüfen, ob der Benutzer eingeloggt ist
if (!isset($_SESSION['benutzer_id'])) {
    header('Location: login.php');
    exit;
}

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

// Gruppen des Benutzers abrufen
$sql = "SELECT g.Bezeichnung 
        FROM gruppe g
        JOIN benutzer_gruppe bg ON g.PK_Gruppe_ID = bg.PK_FK_Gruppe_ID
        WHERE bg.PK_FK_Benutzer_ID = :userId";
$stmt = $pdo->prepare($sql);
$stmt->execute([':userId' => $_SESSION['benutzer_id']]);
$gruppen = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hauptseite - StudyBuddy</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>Willkommen, <?= htmlspecialchars($_SESSION['benutzername']) ?>!</h1>
        <p>Sie sind erfolgreich eingeloggt.</p>

        <h2>Gruppen, in denen Sie Mitglied sind:</h2>
        
            <?php foreach ($gruppen as $gruppe): ?>
                <button class="gruppen"><?= htmlspecialchars($gruppe['Bezeichnung']) ?></button>
            <?php endforeach; ?>
        

        <p><a href="logout.php">Ausloggen</a></p>
    </div>
</body>
</html>
