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
        <div class="header-container">
          <div>
            <h1>Dashboard</h1>
            <p>Willkommen, {{ username }}!</p>
          </div>
          <div v-if="selectedGruppe" class="search-container">
            <input
              type="text"
              v-model="searchQuery"
              @input="searchMessages"
              placeholder="Chat durchsuchen..."
              class="search-input"
            />
          </div>
        </div>
  
        <div v-if="selectedGruppe" class="gruppen-details">
          <h2>{{ getSelectedGruppenName() }}</h2>
          
          <!-- Chat-Bereich -->
          <div class="chat-container">
            <div class="chat-messages" ref="chatMessages">
              <div v-for="message in chatMessages" 
                   :key="message.pk_nachricht_id" 
                   class="message"
                   :class="{ 'own-message': message.pk_benutzer_id === userId }">
                <div class="message-header">
                  <span class="username">{{ message.benutzername }}</span>
                  <span class="timestamp">{{ formatTimestamp(message.timestamp) }}</span>
                </div>
                <div class="message-content">{{ message.inhalt }}</div>
              </div>
            </div>
            
            <div class="chat-input">
              <input 
                v-model="newMessage" 
                @keyup.enter="sendMessage"
                placeholder="Nachricht eingeben..."
                type="text"
              />
              <button @click="sendMessage">Senden</button>
            </div>
          </div>
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
        userId: null,
        gruppen: [],
        selectedGruppe: null,
        chatMessages: [],
        newMessage: '',
        searchQuery: '',
        originalMessages: [],
      }
    },
    created() {
      const user = JSON.parse(localStorage.getItem('user'))
      if (user) {
        this.username = user.benutzername
        this.userId = user.id
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
        if (!this.newMessage.trim() || !this.selectedGruppe) return
        
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
          })
          
          if (response.ok) {
            this.newMessage = ''
            await this.fetchChatMessages()
          }
        } catch (error) {
          console.error('Fehler beim Senden der Nachricht:', error)
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
    font-size: 0.8rem;
    margin-bottom: 0.3rem;
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
  </style>