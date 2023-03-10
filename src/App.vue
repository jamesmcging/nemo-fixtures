<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterView } from "vue-router";
import { storeToRefs } from "pinia";

import { useFixtureStore } from "./stores/fixtureStore";
import { useCompetitionStore } from "@/stores/competitionStore";

    const fixtureStore = useFixtureStore();
    const { currentFixtures } = storeToRefs(fixtureStore);
    const competitionStore = useCompetitionStore();
    const { competitions } = storeToRefs(competitionStore);

    onMounted(() => {
        competitionStore.fetchCompetitions();
        fixtureStore.fetchFixtures();
    })
</script>

<template>
    <RouterView />
</template>

<style scoped>
</style>

