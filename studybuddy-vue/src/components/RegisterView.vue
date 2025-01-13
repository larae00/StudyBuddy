<template>
  <div class="register-container">
    <div class="register-box">
      <h2>Registrierung</h2>
      
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <input type="text" v-model="vorname" placeholder="Vorname" required />
        </div>
        <div class="form-group">
          <input type="text" v-model="nachname" placeholder="Nachname" required />
        </div>
        <div class="form-group">
          <input type="text" v-model="benutzername" placeholder="Benutzername" required />
        </div>
        <div class="form-group">
          <input type="email" v-model="email" placeholder="E-Mail" required />
        </div>
        <div class="form-group password-group">
          <input :type="showPassword ? 'text' : 'password'" v-model="passwort" placeholder="Passwort" required />
          <button type="button" class="toggle-password" @click="showPassword = !showPassword">
            <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
          </button>
        </div>

        <div class="error" v-if="error">{{ error }}</div>
        <div class="password-guidelines">
          <h3>Passwortrichtlinien:</h3>
          <ul>
            <li :class="{ 'valid': passwordChecks.minLength, 'invalid': !passwordChecks.minLength }">
              <i :class="passwordChecks.minLength ? 'fas fa-check' : 'fas fa-times'"></i>
              Mindestens 8 Zeichen
            </li>
            <li :class="{ 'valid': passwordChecks.hasUpperCase, 'invalid': !passwordChecks.hasUpperCase }">
              <i :class="passwordChecks.hasUpperCase ? 'fas fa-check' : 'fas fa-times'"></i>
              Mindestens ein Großbuchstabe
            </li>
            <li :class="{ 'valid': passwordChecks.hasLowerCase, 'invalid': !passwordChecks.hasLowerCase }">
              <i :class="passwordChecks.hasLowerCase ? 'fas fa-check' : 'fas fa-times'"></i>
              Mindestens ein Kleinbuchstabe
            </li>
            <li :class="{ 'valid': passwordChecks.hasNumbers, 'invalid': !passwordChecks.hasNumbers }">
              <i :class="passwordChecks.hasNumbers ? 'fas fa-check' : 'fas fa-times'"></i>
              Mindestens eine Zahl
            </li>
            <li :class="{ 'valid': passwordChecks.hasSpecialChar, 'invalid': !passwordChecks.hasSpecialChar }">
              <i :class="passwordChecks.hasSpecialChar ? 'fas fa-check' : 'fas fa-times'"></i>
              Mindestens ein Sonderzeichen
            </li>
          </ul>
        </div>
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
import { generateInitialsImage } from '../utils/profileImage'

export default {
  name: 'RegisterView',
  data() {
    return {
      vorname: '',
      nachname: '',
      benutzername: '',
      email: '',
      passwort: '',
      error: null,
      showPassword: false,
      passwordChecks: {
        minLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumbers: false,
        hasSpecialChar: false
      }
    }
  },
  watch: {
    passwort: {
      handler(newPassword) {
        this.passwordChecks = {
          minLength: newPassword.length >= 8,
          hasUpperCase: /[A-Z]/.test(newPassword),
          hasLowerCase: /[a-z]/.test(newPassword),
          hasNumbers: /\d/.test(newPassword),
          hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
        }
      },
      immediate: true
    }
  },
  methods: {
    async handleRegister() {
      try {
        const profilbild = generateInitialsImage(this.benutzername);

        await axios.post('http://localhost:3000/api/register', {
          vorname: this.vorname,
          nachname: this.nachname,
          benutzername: this.benutzername,
          email: this.email,
          passwort: this.passwort,
          profilbild: profilbild
        });

        this.$router.push('/login');
      } catch (error) {
        this.error = error.response?.data?.error || 'Ein Fehler ist aufgetreten';
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
  background-color: #5D83B1;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}

button:hover {
  background-color: #6f8caf;
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
  color: #5D83B1;
  text-decoration: none;
}

.password-group {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #666;
  width: auto;
}

.toggle-password:hover {
  color: #5D83B1;
  background: none;
}

.password-group input {
  padding-right: 45px;
}

.password-guidelines {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  border: 1px solid #e9ecef;
}

.password-guidelines h3 {
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: #495057;
}

.password-guidelines ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.password-guidelines li {
  margin: 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.password-guidelines li i {
  width: 16px;
  text-align: center;
}

.password-guidelines li.valid {
  color: #28a745;
}

.password-guidelines li.invalid {
  color: #dc3545;
}

.password-guidelines li.valid i {
  color: #28a745;
}

.password-guidelines li.invalid i {
  color: #dc3545;
}
</style>