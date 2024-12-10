<template>
    <div class="dashboard-container">
      <h1>Dashboard</h1>
      <p>Willkommen, {{ username }}!</p>
    </div>
  </template>
  
  <script>
  export default {
    name: 'DashboardView',
    data() {
      return {
        username: ''
      }
    },
    created() {
      const user = JSON.parse(localStorage.getItem('user'))
      if (user) {
        this.username = user.benutzername
      }
    }
  }
  </script>
  
  <style scoped>
  .dashboard-container {
    padding: 2rem;
  }
  </style>