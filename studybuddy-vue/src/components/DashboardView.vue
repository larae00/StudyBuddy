<template>
  <div class="app-container">
    <!-- Header -->
    <header class="app-header">
      <div class="logo-section">
        <button class="sidebar-toggle" @click="toggleSidebar">
          <i class="fas fa-bars"></i>
        </button>
        <div class="logo-container">
          <img src="@/assets/logo.png" alt="Logo" class="logo" />
        </div>
        <h1 class="app-title">StudyBuddy</h1>
      </div>
      <div class="profile-container" @click="$router.push('/profile')">
        <img :src="profilBild" alt="Profil" class="profile-image" />
      </div>
    </header>

    <div class="dashboard-container">
      <!-- Sidebar für Gruppen -->
      <div class="sidebar" :class="{ 'active': isSidebarOpen }">
        <h2>Gruppen</h2>
        <div class="gruppen-liste">
          <div v-for="gruppe in gruppen" :key="gruppe.pk_gruppe_id" class="gruppe-item"
            :class="{ 'aktiv': selectedGruppe === gruppe.pk_gruppe_id }" @click="selectGruppe(gruppe)">
            {{ gruppe.bezeichnung }}
          </div>
        </div>
      </div>

      <!-- Hauptbereich -->
      <div class="main-content">
        <div class="header-container">
          <div>
            <h1>Dashboard</h1>
            <p>Willkommen, {{ username }}!</p>
          </div>
          <div v-if="selectedGruppe" class="search-container">
            <input type="text" v-model="searchQuery" @input="searchMessages" placeholder="Chat durchsuchen..."
              class="search-input" />
          </div>
        </div>

        <div v-if="selectedGruppe" class="gruppen-details">
          <h2>{{ getSelectedGruppenName() }}</h2>

          <!-- Chat-Bereich -->
          <div class="chat-container">
            <div class="chat-messages" ref="chatMessages">
              <div v-for="message in chatMessages" :key="message.pk_nachricht_id" class="message"
                :class="{ 'own-message': message.pk_benutzer_id === userId }">
                <div class="message-header">
                  <span class="username">{{ message.benutzername }}</span>
                  <div class="message-actions">
                    <span class="timestamp">{{ formatTimestamp(message.timestamp) }}</span>
                    <button v-if="message.pk_benutzer_id === userId" class="delete-button"
                      @click="deleteMessage(message.pk_nachricht_id)">
                      ×
                    </button>
                  </div>
                </div>
                <div class="message-content">
                  <div v-if="message.inhalt.startsWith('[Datei]')">
                    <div class="file-message">
                      <i class="fas fa-file"></i>
                      <div class="file-info">
                        <span class="file-name">{{ message.inhalt.replace('[Datei] ', '') }}</span>
                        <a :href="`http://localhost:3000/api/dokument/${message.pk_nachricht_id}`" download
                          class="download-button">
                          <i class="fas fa-download"></i>
                        </a>
                      </div>
                    </div>
                  </div>
                  <div v-else>
                    {{ message.inhalt }}
                  </div>
                </div>
              </div>
            </div>

            <div class="chat-input">
              <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="Nachricht eingeben..." type="text" />
              <div class="file-upload">
                <label class="file-upload-label">
                  <input type="file" @change="handleFileUpload" accept="*/*" class="file-input" />
                  <i class="fas fa-paperclip"></i>
                </label>
              </div>
              <button @click="sendMessage">Senden</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="easyname-logo">
      <a href="https://www.easyname.at" target="_blank" rel="noopener noreferrer">
        <img src="@/assets/Primary Logo.png" alt="Easyname Logo" />
      </a>
    </div>
    <div v-if="showDeletePopup" class="popup-overlay">
      <div class="popup-content">
        <h3>Nachricht löschen</h3>
        <p>Möchten Sie diese Nachricht wirklich löschen?</p>
        <div class="popup-buttons">
          <button class="cancel-button" @click="cancelDelete">Abbrechen</button>
          <button class="confirm-button" @click="confirmDelete">Löschen</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { generateInitialsImage } from '../utils/profileImage'

export default {
  name: 'DashboardView',
  data() {
    return {
      username: '',
      userId: null,
      gruppen: [],
      selectedGruppe: null,
      chatMessages: [],
      newMessage: '',
      searchQuery: '',
      originalMessages: [],
      profilBild: null,
      isSidebarOpen: false,
      showDeletePopup: false,
      messageToDelete: null,
    }
  },
  created() {
    const user = JSON.parse(localStorage.getItem('user'))
    if (user) {
      this.username = user.benutzername
      this.userId = user.id
      this.profilBild = user.profilbildSpeicherort || generateInitialsImage(user.benutzername)
      this.fetchGruppen()
    }
  },
  methods: {
    async fetchGruppen() {
      try {
        const response = await fetch('http://localhost:3000/api/gruppen')
        if (response.ok) {
          this.gruppen = await response.json()
        }
      } catch (error) {
        console.error('Fehler beim Laden der Gruppen:', error)
      }
    },
    async fetchChatMessages() {
      if (!this.selectedGruppe) return

      try {
        const response = await fetch(`http://localhost:3000/api/chat/${this.selectedGruppe}`)
        if (response.ok) {
          this.chatMessages = await response.json()
          this.originalMessages = [...this.chatMessages]
          this.$nextTick(() => {
            this.scrollToBottom()
          })
        }
      } catch (error) {
        console.error('Fehler beim Laden der Nachrichten:', error)
      }
    },
    async sendMessage() {
      if (!this.newMessage.trim() || !this.selectedGruppe) return;

      try {
        const response = await fetch(`http://localhost:3000/api/chat/${this.selectedGruppe}/message`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            inhalt: this.newMessage.trim(),
            benutzerId: this.userId
          })
        });

        if (response.ok) {
          this.newMessage = '';
          await this.fetchChatMessages();
        }
      } catch (error) {
        console.error('Fehler beim Senden der Nachricht:', error);
      }
    },

    selectGruppe(gruppe) {
      this.selectedGruppe = gruppe.pk_gruppe_id
      this.fetchChatMessages()
    },
    getSelectedGruppenName() {
      const gruppe = this.gruppen.find(g => g.pk_gruppe_id === this.selectedGruppe)
      return gruppe ? gruppe.bezeichnung : ''
    },
    formatTimestamp(timestamp) {
      return new Date(timestamp).toLocaleString()
    },
    scrollToBottom() {
      const chatMessages = this.$refs.chatMessages
      chatMessages.scrollTop = chatMessages.scrollHeight
    },
    searchMessages() {
      if (!this.searchQuery.trim()) {
        this.chatMessages = [...this.originalMessages]
        return
      }

      const query = this.searchQuery.toLowerCase()
      this.chatMessages = this.originalMessages.filter(message =>
        message.inhalt.toLowerCase().includes(query) ||
        message.benutzername.toLowerCase().includes(query)
      )
    },
    deleteMessage(messageId) {
      this.messageToDelete = messageId;
      this.showDeletePopup = true;
    },
    async confirmDelete() {
      try {
        const response = await fetch(
          `http://localhost:3000/api/chat/message/${this.messageToDelete}?benutzerId=${this.userId}`,
          {
            method: 'DELETE'
          }
        );

        if (response.ok) {
          this.chatMessages = this.chatMessages.filter(
            msg => msg.pk_nachricht_id !== this.messageToDelete
          );
          this.originalMessages = this.originalMessages.filter(
            msg => msg.pk_nachricht_id !== this.messageToDelete
          );
        } else {
          const error = await response.json();
          console.error('Fehler beim Löschen:', error);
        }
      } catch (error) {
        console.error('Fehler beim Löschen der Nachricht:', error);
      }
      this.closeDeletePopup();
    },
    cancelDelete() {
      this.closeDeletePopup();
    },
    closeDeletePopup() {
      this.showDeletePopup = false;
      this.messageToDelete = null;
    },
    validateFileName(fileName, gruppenName) {
      // Format: [Gruppenname]_[Thema]_x.x
      const regex = new RegExp(`^${gruppenName}_[A-Za-z0-9]+_\\d+\\.\\d+.*$`);
      return regex.test(fileName);
    },

    async handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      const gruppenName = this.getSelectedGruppenName();
      if (!this.validateFileName(file.name, gruppenName)) {
        alert(`Die Datei muss dem Format "${gruppenName}_Thema_x.x" entsprechen.\nBeispiel: ${gruppenName}_Test1_1.0`);
        event.target.value = ''; // Reset file input
        return;
      }

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('benutzerId', this.userId);
        formData.append('gruppeId', this.selectedGruppe);

        const response = await fetch('http://localhost:3000/api/dokument', {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          await this.fetchChatMessages();
        }
      } catch (error) {
        console.error('Fehler beim Hochladen der Datei:', error);
      }

    },
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen;
    }
  },
  watch: {
    selectedGruppe() {
      this.searchQuery = ''
      this.fetchChatMessages()
    }
  }
}
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  overflow-x: hidden;
}

.app-header {
  background-color: white;
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo-container {
  height: 40px;
  width: 40px;
}

.logo {
  height: 100%;
  width: 100%;
  object-fit: contain;
}

.app-title {
  font-size: 1.5rem;
  color: #2c3e50;
  margin: 0;
  font-weight: bold;
}

.profile-container {
  height: 40px;
  width: 40px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
}

.profile-image {
  height: 100%;
  width: 100%;
  object-fit: cover;
}

.dashboard-container {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 250px;
  background-color: #f5f5f5;
  padding: 1rem;
  border-right: 1px solid #ddd;
  transition: transform 0.3s ease;
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
  background-color: #5D83B1;
  color: white;
}

h2 {
  margin-bottom: 1rem;
  color: #333;
}

.chat-container {
  margin-top: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  height: 500px;
  display: flex;
  flex-direction: column;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.message {
  margin-bottom: 1rem;
  padding: 0.5rem;
  background-color: #f0f0f0;
  border-radius: 4px;
  max-width: 70%;
}

.own-message {
  margin-left: auto;
  background-color: #5D83B1;
  color: white;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  margin-bottom: 0.3rem;
}

.message-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.delete-button {
  background: none;
  border: none;
  color: #999;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0 0.3rem;
  line-height: 1;
  border-radius: 50%;
}

.delete-button:hover {
  background-color: rgba(0, 0, 0, 0.1);
  color: #666;
}

.own-message .delete-button {
  color: rgba(255, 255, 255, 0.8);
}

.own-message .delete-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.message-content {
  word-break: break-word;
}

.chat-input {
  display: flex;
  padding: 1rem;
  border-top: 1px solid #ddd;
  gap: 0.5rem;
}

.chat-input input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.chat-input button {
  padding: 0.5rem 1rem;
  background-color: #5D83B1;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.chat-input button:hover {
  background-color: #517199;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.search-container {
  margin-top: 1rem;
}

.search-input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  width: 200px;
}

.search-input:focus {
  outline: none;
  border-color: #5D83B1;
}

.message.highlight {
  background-color: #fff3cd;
}

.own-message.highlight {
  background-color: #7ba3d1;
}

.file-message {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.file-name {
  flex: 1;
  word-break: break-all;
}

.download-button {
  color: inherit;
  text-decoration: none;
  padding: 0.5rem;
  border-radius: 4px;
}

.download-button:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.own-message .download-button {
  color: white;
}

.sidebar-toggle {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #2c3e50;
  padding: 0.5rem;
}

/* Tablet & Mobile Styles */
@media (max-width: 768px) {
  .sidebar-toggle {
    display: block;
  }

  .app-header {
    padding: 0 1rem;
  }

  .sidebar {
    position: fixed;
    left: 0;
    top: 60px;
    bottom: 0;
    z-index: 100;
    transform: translateX(-100%);
  }

  .sidebar.active {
    transform: translateX(0);
  }

  .main-content {
    padding: 1rem;
  }

  .chat-container {
    height: calc(100vh - 200px);
  }

  .message {
    max-width: 85%;
  }
}

/* Medium-Small Devices */
@media (max-width: 600px) {
  .main-content {
    padding: 0.3rem;
    width: 100%;
  }

  .chat-container {
    margin: 0.3rem 0;
    height: calc(100vh - 190px);
    border-radius: 0;
    border-left: none;
    border-right: none;
  }

  .message {
    max-width: 75%;
    font-size: 0.85rem;
    padding: 0.4rem;
  }

  .chat-messages {
    padding: 0.5rem;
  }

  .message-header {
    font-size: 0.7rem;
  }

  .header-container {
    flex-direction: column;
    align-items: stretch;
    margin-bottom: 1rem;
  }

  .search-input {
    width: 100%;
    margin-top: 0.5rem;
  }

  .chat-input {
    padding: 0.4rem;
    gap: 0.3rem;
  }

  .chat-input input {
    padding: 0.4rem;
    font-size: 0.85rem;
    min-width: 0;
    /* Verhindert, dass Input zu breit wird */
  }

  .chat-input button {
    padding: 0.4rem 0.6rem;
    font-size: 0.85rem;
    white-space: nowrap;
  }
}

/* Extra Small Devices */
@media (max-width: 360px) {
  .main-content {
    padding: 0.2rem;
  }

  .chat-container {
    margin: 0.2rem 0;
    height: calc(100vh - 170px);
  }

  .message {
    max-width: 70%;
    padding: 0.3rem;
    margin-bottom: 0.3rem;
    font-size: 0.8rem;
  }

  .message-header {
    font-size: 0.65rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.1rem;
  }

  .chat-input {
    padding: 0.3rem;
    gap: 0.2rem;
  }

  .chat-input input {
    padding: 0.3rem;
    font-size: 0.8rem;
  }

  .chat-input button {
    padding: 0.3rem 0.5rem;
    font-size: 0.8rem;
    min-width: 50px;
  }

  .file-message {
    padding: 0.3rem;
    gap: 0.3rem;
  }

  .file-name {
    font-size: 0.75rem;
  }

  .download-button {
    padding: 0.3rem;
  }
}

/* Ultra Small Devices */
@media (max-width: 320px) {
  .message {
    max-width: 65%;
    font-size: 0.75rem;
  }

  .message-header {
    font-size: 0.6rem;
  }

  .chat-input {
    padding: 0.2rem;
    gap: 0.2rem;
  }

  .chat-input input {
    padding: 0.3rem;
    font-size: 0.75rem;
  }

  .chat-input button {
    padding: 0.3rem 0.4rem;
    font-size: 0.75rem;
    min-width: 45px;
  }
}

.file-upload {
  display: flex;
  align-items: center;
}

.file-upload-label {
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  color: #5D83B1;
}

.file-upload-label:hover {
  background-color: rgba(93, 131, 177, 0.1);
}

.file-input {
  display: none;
}

/* Medium-Small Devices */
@media (max-width: 600px) {
  .file-upload-label {
    padding: 0.4rem;
  }

  .file-upload-label i {
    font-size: 0.9rem;
  }
}

/* Extra Small Devices */
@media (max-width: 360px) {
  .file-upload-label {
    padding: 0.3rem;
  }

  .file-upload-label i {
    font-size: 0.85rem;
  }
}

/* Ultra Small Devices */
@media (max-width: 320px) {
  .file-upload-label {
    padding: 0.2rem;
  }

  .file-upload-label i {
    font-size: 0.8rem;
  }
}

.easyname-logo {
  position: fixed;
  left: 20px;
  bottom: 20px;
  z-index: 1000;
  width: 100px;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.easyname-logo img {
  width: 100%;
  height: auto;
}

.easyname-logo:hover {
  opacity: 1;
}

@media (max-width: 768px) {
  .easyname-logo {
    width: 80px;
    left: 10px;
    bottom: 10px;
  }
}

.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.popup-content {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 90%;
}

.popup-content h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
}

.popup-content p {
  margin-bottom: 1.5rem;
  color: #666;
}

.popup-buttons {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.popup-buttons button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.cancel-button {
  background-color: #e0e0e0;
  color: #666;
}

.cancel-button:hover {
  background-color: #d0d0d0;
}

.confirm-button {
  background-color: #dc3545;
  color: white;
}

.confirm-button:hover {
  background-color: #c82333;
}

@media (max-width: 480px) {
  .popup-content {
    padding: 1.5rem;
  }

  .popup-buttons {
    flex-direction: column;
  }

  .popup-buttons button {
    width: 100%;
  }
}
</style>