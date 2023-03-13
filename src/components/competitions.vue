<script setup lang="ts">
import { useCompetitionStore } from "@/stores/competitionStore";
import { storeToRefs } from "pinia";
import { onMounted, ref } from "vue";
import mainMenu from "./mainMenu.vue"
import type { Header } from "vue3-easy-data-table";
import type Competition from "@/types/competition";
import { useToast } from "vue-toastification";
import { useFixtureStore } from "@/stores/fixtureStore";
import router from "@/router";
const toast = useToast();
const showCreateEvent = ref(false);
const newEventName = ref(null);
const competitionStore = useCompetitionStore();
const { competitions } = storeToRefs(competitionStore);
const fixtureStore = useFixtureStore();

function fetchCompetitions(showToasts = true) {
  if (showToasts) toast('Fetching competition');
  competitionStore.fetchCompetitions().then(() => {
    if (showToasts) {
      toast.clear();
      toast.success('Loaded competitions');
    }
  });
};

function updateCompetition(competitionId: number) {
  toast(`Updating competition ${competitionId}`);
  competitionStore
    .updateCompetition(competitionId)
    .then(response => {
      if (response) {
        toast.success(response);
      }
      fetchCompetitions(false);
    })
    .catch(error => {
      console.error(error);
      toast.clear();
      toast.error('Error loading competitions');
    });
}

function addCompetitionById($event: Event) {
  const competitionId = Number(($event.target as HTMLInputElement).value);
  if (competitionId > 100000) {
    toast(`Fetching fixtures for competition ${competitionId}`);
    competitionStore.addCompetitionById(competitionId)
      .then(() => {
        toast.success(`Added new competition with id ${competitionId}`);
      })
      .catch(error => {
        toast.clear();
        toast.error('Error loading competitions', error);
      });
  } else {
    toast.error('Competition IDs are quite large...');
  }
}

function updateAllCompetitions() {
  competitions.value.forEach((competition: Competition) => {
    updateCompetition(Number(competition.id))
  });
}

function addCompetitionByName() {
  if (newEventName.value === null) {
    toast.error('Competition must have a name');
  } else {
    competitionStore.addCompetitionByName(newEventName.value);
  }
}

function toggleEventCreationWindow() {
  showCreateEvent.value = !showCreateEvent.value
}

function handleGradeChange($event: Event, competitionId: number) {
  const seniorGrade = ($event.target as HTMLInputElement).checked;
  competitionStore.toggleSeniorGrade(competitionId, seniorGrade);
}

const handleCompetitionNameClick = ($event:Event, competitionName: string) => {
  fixtureStore.setCompetitionFilter(competitionName);
  router.push('/fixtures');
}

const headers: Header[] = [
  { text: "Id", value: "id" },
  { text: "Name", value: "name", sortable: true },
  { text: "Senior Grade", value: "seniorGrade" },
  { text: "Last updated", value: "updatedAt" },
  { text: "Actions", value: "createdAt" }
];
</script>

<template>
  <main-menu title="Competitions & Events" show-nav="true"></main-menu>
  <div id="content">

    <div id="competition-actions">
      <div class="input-group">
        <input type="text" class="form-control" placeholder="Add competition by ID"
          @keyup.enter="addCompetitionById($event)">
      </div>
      <div class="btn-group">
        <button class="btn btn-outline-secondary" @click="toggleEventCreationWindow">Create Competition</button>
        <button class="btn btn-outline-secondary" @click="updateAllCompetitions">Update all competitions</button>
      </div>
    </div>

    <div v-if="showCreateEvent" class="create-event-window">
      <h5>Create Competition or Event</h5>
      <div class="input-group">
        <input type="text" v-model="newEventName" class="form-control" placeholder="Competition or event name"
          @keyup.enter="addCompetitionByName">
        <button class="btn btn-outline-secondary" @click="addCompetitionByName" type="button">Create</button>
        <button class="btn btn-outline-secondary" @click="showCreateEvent = false" type="button">Cancel</button>
      </div>
    </div>

    <EasyDataTable :headers="headers" :items="competitions" alternating>
      <template #item-name="item">
        <span @click="handleCompetitionNameClick($event, item.name)">{{  item.name }}</span>
      </template>
      <template #item-seniorGrade="item">
        <input type="checkbox" v-model="item.seniorGrade" @click="handleGradeChange($event, item.id)">
      </template>
      <template #item-createdAt="item">
        <button class="btn btn-outline-secondary btn-sm" v-if="item.id > 1000" @click="updateCompetition(item.id)">Update</button>
      </template>
    </EasyDataTable>
  </div>
</template>

<style lang="scss" scoped>
#content {
  margin-top: 1rem;
}

#competition-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;

  .input-group {
    padding-right: 1rem;
  }
}

.create-event-window {
  background-color: bisque;
  padding: 1rem;
  margin: 1rem;
}
</style>
