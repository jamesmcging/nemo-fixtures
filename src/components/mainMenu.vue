<script setup lang="ts">
  const props = defineProps(['title']);
</script>

<template>
  <div id="main-menu-top">
      <img src="@/assets/nemo.png">
      <h1>{{ props.title }}</h1>
  </div>
  <div id="main-menu-bottom">
      <RouterLink to="/">Home</RouterLink> |
      <RouterLink to="/competitions">Competitions</RouterLink> |
      <RouterLink to="/fixtures">Fixtures</RouterLink>
  </div>
</template>

<style scoped>
#main-menu-top {
  display: flex;
  align-items: center;
}
img {
  height: 2rem;
  width: 2rem;
  margin-right: 1rem;
}
</style>
