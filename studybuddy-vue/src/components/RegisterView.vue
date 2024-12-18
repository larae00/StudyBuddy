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
      showPassword: false
    }
  },
  methods: {
    validatePassword(password) {
      const minLength = password.length >= 8;
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

      if (!minLength) return 'Das Passwort muss mindestens 8 Zeichen lang sein.';
      if (!hasUpperCase) return 'Das Passwort muss mindestens einen Großbuchstaben enthalten.';
      if (!hasLowerCase) return 'Das Passwort muss mindestens einen Kleinbuchstaben enthalten.';
      if (!hasNumbers) return 'Das Passwort muss mindestens eine Zahl enthalten.';
      if (!hasSpecialChar) return 'Das Passwort muss mindestens ein Sonderzeichen enthalten.';

      return null;
    },

    async handleRegister() {
      const passwordError = this.validatePassword(this.passwort);
      if (passwordError) {
        this.error = passwordError;
        return;
      }
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
</style>