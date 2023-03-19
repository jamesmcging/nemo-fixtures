<script setup lang="ts">
  const props = defineProps(['title', 'showNav']);
</script>

<template>
  <div id="main-menu-top">
    <RouterLink to="/">
      <img src="@/assets/nemo.png">
    </RouterLink>
    <h1>{{ props.title }}</h1>
  </div>

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
