<template>
  <div id="app">
    <h1>StudyBuddy - User Management</h1>
    <AddUser @user-added="fetchUsers" />
    <UserList :users="users" />
  </div>
</template>

<script>
import UserList from './components/UserList.vue';
import AddUser from './components/AddUser.vue';
import axios from 'axios';

export default {
  name: 'App',
  components: {
    UserList,
    AddUser,
  },
  data() {
    return {
      users: [],
    };
  },
  methods: {
    async fetchUsers() {
      try {
        const response = await axios.get('http://localhost:3000/api/users');
        this.users = response.data;
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    },
  },
  created() {
    this.fetchUsers();
  },
};
</script>

<style>
#app {
  font-family: Arial, sans-serif;
  text-align: center;
  margin-top: 20px;
}
</style>
