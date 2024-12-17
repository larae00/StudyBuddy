<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  --header-height: 60px;
  --footer-height: 60px;
  font-family: Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin: 0;
  padding: 0;
  min-height: 100vh;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: #f5f5f5;
}

h1,
h2 {
  margin-bottom: 1rem;
}

.error {
  color: #dc3545;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

button {
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>