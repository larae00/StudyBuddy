<template>
    <div class="login-container">
      <div class="login-box">
        <h2>Login</h2>
        <form @submit.prevent="handleLogin">
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
              type="password"
              v-model="passwort"
              placeholder="Passwort"
              required
            />
          </div>
          <div class="error" v-if="error">{{ error }}</div>
          <button type="submit">Anmelden</button>
        </form>
        <p class="register-link">
          Noch kein Konto? 
          <router-link to="/register">Hier registrieren</router-link>
        </p>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios'
  
  export default {
    name: 'LoginView',
    data() {
      return {
        benutzername: '',
        passwort: '',
        error: null
      }
    },
    methods: {
      async handleLogin() {
        try {
          const response = await axios.post('http://localhost:3000/api/login', {
            benutzername: this.benutzername,
            passwort: this.passwort
          })
          
          localStorage.setItem('user', JSON.stringify(response.data.user))
          this.$router.push('/dashboard')
        } catch (error) {
          this.error = error.response?.data?.error || 'Ein Fehler ist aufgetreten'
        }
      }
    }
  }
  </script>
  
  <style scoped>
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f5f5f5;
  }
  
  .login-box {
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
  
  .register-link {
    text-align: center;
    margin-top: 1rem;
  }
  
  a {
    color: #4CAF50;
    text-decoration: none;
  }
  </style>