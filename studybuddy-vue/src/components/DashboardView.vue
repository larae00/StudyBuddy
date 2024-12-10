<template>
    <div class="dashboard-container">
      <!-- Sidebar für Gruppen -->
      <div class="sidebar">
        <h2>Gruppen</h2>
        <div class="gruppen-liste">
          <div v-for="gruppe in gruppen" 
               :key="gruppe.pk_gruppe_id" 
               class="gruppe-item"
               :class="{ 'aktiv': selectedGruppe === gruppe.pk_gruppe_id }"
               @click="selectGruppe(gruppe)">
            {{ gruppe.bezeichnung }}
          </div>
        </div>
      </div>
  
      <!-- Hauptbereich -->
      <div class="main-content">
        <h1>Dashboard</h1>
        <p>Willkommen, {{ username }}!</p>
        <div v-if="selectedGruppe" class="gruppen-details">
          <h2>{{ getSelectedGruppenName() }}</h2>
          <!-- Hier können später weitere Gruppendetails angezeigt werden -->
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'DashboardView',
    data() {
      return {
        username: '',
        gruppen: [],
        selectedGruppe: null
      }
    },
    created() {
      const user = JSON.parse(localStorage.getItem('user'))
      if (user) {
        this.username = user.benutzername
        this.fetchGruppen()
      }
    },
    methods: {
      async fetchGruppen() {
        try {
          const response = await fetch('http://localhost:3000/api/gruppen', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          })
          if (response.ok) {
            this.gruppen = await response.json()
          }
        } catch (error) {
          console.error('Fehler beim Laden der Gruppen:', error)
        }
      },
      selectGruppe(gruppe) {
        this.selectedGruppe = gruppe.pk_gruppe_id
      },
      getSelectedGruppenName() {
        const gruppe = this.gruppen.find(g => g.pk_gruppe_id === this.selectedGruppe)
        return gruppe ? gruppe.bezeichnung : ''
      }
    }
  }
  </script>
  
  <style scoped>
  .dashboard-container {
    display: flex;
    min-height: 100vh;
  }
  
  .sidebar {
    width: 250px;
    background-color: #f5f5f5;
    padding: 1rem;
    border-right: 1px solid #ddd;
  }
  
  .main-content {
    flex: 1;
    padding: 2rem;
  }
  
  .gruppen-liste {
    margin-top: 1rem;
  }
  
  .gruppe-item {
    padding: 0.75rem 1rem;
    margin: 0.25rem 0;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .gruppe-item:hover {
    background-color: #e0e0e0;
  }
  
  .gruppe-item.aktiv {
    background-color: #007bff;
    color: white;
  }
  
  h2 {
    margin-bottom: 1rem;
    color: #333;
  }
  </style>