<script setup lang="ts">
import { ref } from 'vue';
import { useAuthenticationStore } from '@/stores/authenticationStore';
import { useToast } from "vue-toastification";
const toast = useToast();
const email = ref('');
const password = ref('');
const authenticationStore = useAuthenticationStore();

async function login() {
  try {
    if (email.value.length < 4) {
      toast.error('Your email is required')
    } else if (password.value.length < 4) {
      toast.error('Your password is too short')
    }
    
    if (await authenticationStore.login(email.value, password.value)) {
      toast.success('Login successful')
    } else {
      toast.error('login unsuccessful')
    }  
  } catch (error) {
    console.error(error)
    toast.error('login unsuccessful')
  }
}

async function addUser() {
  try {
    const user = await authenticationStore.addUser('Pat Murphy', email.value, password.value)
    console.log('user', user);
  } catch (error) {
    
  }
}
</script>

<template>
  <h1>Login</h1>
  <input type="text" v-model="email" placeholder="email">
  <input type="password" v-model="password" placeholder="password" @keyup.enter="login()">
  <button @click="login()">login</button>
  <!-- <button @click="addUser()">add user</button> -->
</template>

<style scoped>
</style>
