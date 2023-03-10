<script setup lang="ts">
  const props = defineProps(['title', 'showNav']);
</script>

<template>
  
  <RouterLink to="/">
    <div id="main-menu-top">
      <img src="@/assets/nemo.png">
      <h1>{{ props.title }}</h1>
    </div>
  </RouterLink>

  <div id="main-menu-bottom" v-if="showNav">
      <RouterLink to="/fixtures">Fixtures</RouterLink> |
      <RouterLink to="/competitions">Competitions</RouterLink>
  </div>
</template>

<style lang="scss" scoped>
#main-menu-top {
  display: flex;
  align-items: center;
 
  img {
    height: 2rem;
    width: 2rem;
    margin-right: 1rem;
  }
  h1 {
    color: black;
  }
}
</style>
