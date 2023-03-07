<script setup lang="ts">
import mainMenu from "./mainMenu.vue";
const url = `${import.meta.env.VITE_FIXTURE_SERVICE_URL}/fixtures/excel`;
</script>

<template>
  <main-menu title="Home"></main-menu>
  <div class="cards">
    <router-link to="competitions">
      <section class="card">
        <h1>Competitions</h1>
      </section>
    </router-link>
    
    <section class="card">
      <router-link to="fixtures">
        <h1>Fixtures</h1>
      </router-link>
      <a :href="url" download><button>Download excel</button></a>
    </section>
    
  </div>
</template>

<style lang="scss" scoped>
 .cards {
    display: flex;
    section.card {
      margin: 1rem 1rem 1rem 0;
      padding: 0.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 20rem;
      width: 15rem;
      background-color:aliceblue;

      h1 {
        color: black;
      }
    }
}
</style>
