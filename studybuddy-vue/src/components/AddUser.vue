<template>
  <div>
    <h2>Add a User</h2>
    <form @submit.prevent="addUser">
      <input
        type="text"
        v-model="name"
        placeholder="Name"
        required
      />
      <input
        type="email"
        v-model="email"
        placeholder="Email"
        required
      />
      <button type="submit">Add User</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AddUser',
  data() {
    return {
      name: '',
      email: '',
    };
  },
  methods: {
    async addUser() {
      try {
        await axios.post('http://localhost:3000/api/users', {
          name: this.name,
          email: this.email,
        });
        this.name = '';
        this.email = '';
        this.$emit('user-added'); // Notify parent to refresh user list
      } catch (error) {
        console.error('Error adding user:', error);
      }
    },
  },
};
</script>

<style scoped>
form {
  margin: 20px auto;
  display: flex;
  flex-direction: column;
  max-width: 300px;
}
input {
  margin-bottom: 10px;
  padding: 10px;
  font-size: 16px;
}
button {
  padding: 10px;
  font-size: 16px;
  background-color: #4caf50;
  color: white;
  border: none;
  cursor: pointer;
}
button:hover {
  background-color: #45a049;
}
</style>
