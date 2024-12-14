<template>
  <div class="profile-container">
    <div class="profile-box">
      <h2 class="profile-title">Mein Profil</h2>
      <div class="profile-info">
        <div class="profile-image-section">
          <div class="profile-image-container">
            <img :src="profilBild" alt="Profilbild" class="profile-image" />
            <div class="image-upload-overlay" @click="triggerFileInput">
              <i class="fas fa-camera"></i>
              <span>Bild ändern</span>
            </div>
          </div>
          <input type="file" ref="fileInput" @change="handleImageUpload" accept="image/*" style="display: none" />
        </div>
        <div class="user-details">
          <div class="detail-item">
            <label>Benutzername</label>
            <p>{{ userInfo.benutzername }}</p>
          </div>
          <div class="detail-item">
            <label>Vorname</label>
            <p>{{ userInfo.vorname }}</p>
          </div>
          <div class="detail-item">
            <label>Nachname</label>
            <p>{{ userInfo.nachname }}</p>
          </div>
          <div class="detail-item">
            <label>E-Mail</label>
            <p>{{ userInfo.email }}</p>
          </div>
        </div>
      </div>
      <div class="actions">
        <button @click="$router.push('/dashboard')" class="back-btn">
          <i class="fas fa-arrow-left"></i> Zurück
        </button>
        <button @click="logout" class="logout-btn">
          <i class="fas fa-sign-out-alt"></i> Abmelden
        </button>
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
        id: '',
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
      this.userInfo = {
        id: user.id,
        benutzername: user.benutzername,
        vorname: user.vorname,
        nachname: user.nachname,
        email: user.email,
        profilbildSpeicherort: user.profilbildSpeicherort
      }
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
    },
    logout() {
      localStorage.removeItem('user')
      this.$router.push('/login')
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
  padding: 3rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 700px;
}

.profile-title {
  color: #2c3e50;
  text-align: center;
  font-size: 2rem;
  margin-bottom: 2rem;
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 3rem;
  margin: 2rem 0;
}

.profile-image-section {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto;
}

.profile-image-container {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.user-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-item {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #5D83B1;
}

.detail-item label {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
  display: block;
}

.detail-item p {
  margin: 0;
  font-size: 1.1rem;
  color: #2c3e50;
  font-weight: 500;
}

.actions {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
}

button {
  padding: 0.8rem 2rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.back-btn {
  background-color: #6c757d;
  color: white;
}

.back-btn:hover {
  background-color: #5a6268;
}

.logout-btn {
  background-color: #dc3545;
  color: white;
}

.logout-btn:hover {
  background-color: #c82333;
}

.image-upload-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.profile-image-container:hover .image-upload-overlay {
  opacity: 1;
}

.image-upload-overlay i {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 768px) {
  .profile-info {
    flex-direction: column;
    align-items: center;
  }

  .profile-box {
    padding: 2rem;
  }
}
</style>