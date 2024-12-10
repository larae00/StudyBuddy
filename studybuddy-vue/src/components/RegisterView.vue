<template>
    <div class="register-container">
      <div class="register-box">
        <h2>Registrierung</h2>
        <form @submit.prevent="handleRegister">
          <div class="form-group">
            <input
              type="text"
              v-model="vorname"
              placeholder="Vorname"
              required
            />
          </div>
          <div class="form-group">
            <input
              type="text"
              v-model="nachname"
              placeholder="Nachname"
              required
            />
          </div>
          <div class="form-group">
            <input
              type="text"
              v-model="benutzername"
              placeholder="Benutzername"
              required
            />
          </div>
          <div class="form-group">
            <input
              type="email"
              v-model="email"
              placeholder="E-Mail"
              required
            />
          </div>
          <div class="form-group">
            <input
              type="password"
              v-model="passwort"
              placeholder="Passwort"
              required
            />
          </div>
          <div class="error" v-if="error">{{ error }}</div>
          <button type="submit">Registrieren</button>
        </form>
        <p class="login-link">
          Bereits registriert? 
          <router-link to="/login">Hier anmelden</router-link>
        </p>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios'
  
  export default {
    name: 'RegisterView',
    data() {
      return {
        vorname: '',
        nachname: '',
        benutzername: '',
        email: '',
        passwort: '',
        error: null
      }
    },
    methods: {
    async handleRegister() {
      try {
        await axios.post('http://localhost:3000/api/register', {
          vorname: this.vorname,
          nachname: this.nachname,
          benutzername: this.benutzername,
          email: this.email,
          passwort: this.passwort
        })
        
        this.$router.push('/login')
      } catch (error) {
        this.error = error.response?.data?.error || 'Ein Fehler ist aufgetreten'
      }
    }
  }
}
</script>
  
  <style scoped>
  .register-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f5f5f5;
  }
  
  .register-box {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  input {
    width: 100%;
    padding: 0.8rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  button {
    width: 100%;
    padding: 0.8rem;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #45a049;
  }
  
  .error {
    color: red;
    margin-bottom: 1rem;
  }
  
  .login-link {
    text-align: center;
    margin-top: 1rem;
  }
  
  a {
    color: #4CAF50;
    text-decoration: none;
  }
  </style>