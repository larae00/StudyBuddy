<template>
  <div class="profile-container">
    <div class="profile-box">
      <h2>Mein Profil</h2>
      <div class="profile-info">
        <div class="profile-image-container">
          <img :src="profilBild" alt="Profilbild" class="profile-image" />
          <div class="image-upload-overlay" @click="triggerFileInput">
            <span>Bild ändern</span>
          </div>
          <input
            type="file"
            ref="fileInput"
            @change="handleImageUpload"
            accept="image/*"
            style="display: none"
          />
        </div>
        <div class="user-details">
          <p><strong>Benutzername:</strong> {{ userInfo.benutzername }}</p>
          <p><strong>Vorname:</strong> {{ userInfo.vorname }}</p>
          <p><strong>Nachname:</strong> {{ userInfo.nachname }}</p>
          <p><strong>E-Mail:</strong> {{ userInfo.email }}</p>
        </div>
      </div>
      <div class="actions">
        <button @click="$router.push('/dashboard')">Zurück zum Dashboard</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { generateInitialsImage, resizeImage } from '../utils/profileImage'

export default {
  name: 'ProfileView',
  data() {
    return {
      userInfo: {
        benutzername: '',
        vorname: '',
        nachname: '',
        email: '',
        profilbildSpeicherort: ''
      }
    }
  },
  computed: {
    profilBild() {
      return this.userInfo.profilbildSpeicherort || generateInitialsImage(this.userInfo.benutzername)
    }
  },
  created() {
    const user = JSON.parse(localStorage.getItem('user'))
    if (user) {
      this.userInfo = user
    }
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    async handleImageUpload(event) {
      const file = event.target.files[0]
      if (!file) return

      try {
        const resizedImage = await resizeImage(file)
        
        await axios.put(`http://localhost:3000/api/user/${this.userInfo.id}/profileimage`, {
          profilbild: resizedImage
        })

        this.userInfo.profilbildSpeicherort = resizedImage
        
        const user = JSON.parse(localStorage.getItem('user'))
        user.profilbildSpeicherort = resizedImage
        localStorage.setItem('user', JSON.stringify(user))
      } catch (error) {
        console.error('Fehler beim Hochladen des Bildes:', error)
      }
    }
  }
}
</script>

<style scoped>
.profile-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 2rem;
}

.profile-box {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
}

.profile-info {
  display: flex;
  gap: 2rem;
  margin: 2rem 0;
}

.profile-image-container {
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #5D83B1;
  cursor: pointer;
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-details p {
  margin: 0.5rem 0;
  font-size: 1.1rem;
}

.actions {
  margin-top: 2rem;
}

button {
  padding: 0.8rem 1.5rem;
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

.image-upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-upload-overlay:hover {
  opacity: 1;
}

.image-upload-overlay span {
  color: white;
  font-size: 1rem;
  text-align: center;
  padding: 0.5rem;
}
</style>