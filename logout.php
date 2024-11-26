<?php
session_start();
session_destroy();

// Weiterleitung zur Login-Seite
header('Location: login.php');
exit;
?>
