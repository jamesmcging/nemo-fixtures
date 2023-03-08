<script setup lang="ts">
  import { useCompetitionStore } from "@/stores/competitionStore";
  import { storeToRefs } from "pinia";
  import { onMounted, ref } from "vue";
  import mainMenu from "./mainMenu.vue"
  import type { Header } from "vue3-easy-data-table";
  import type Competition from "@/types/competition";
  import { useToast } from "vue-toastification";
  const toast = useToast();
  const showCreateEvent = ref(false);
  const newEventName = ref(null);
  const competitionStore = useCompetitionStore();
  const { competitions } = storeToRefs(competitionStore);

  onMounted(() => {
    fetchCompetitions();
  })

  function fetchCompetitions(showToasts = true) {
    if (showToasts) toast('Fetching competition');
    competitionStore.fetchCompetitions().then( () => {
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
      .then(response => {
        toast.success(response || 'Default toasts message');
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
    competitions.value.forEach( (competition: Competition) => {
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

  const headers: Header[] = [
    { text: "Id", value: "id"},
    { text: "Name", value: "name", sortable: true},
    { text: "Last updated", value: "updatedAt"},
    { text: "Actions", value: "createdAt"}
  ];
</script>

<template>
  <main-menu title="Competitions & Events"></main-menu>
  <div id="content">
    <div id="competition-actions">
      <div class="input-group">
        <input type="text" class="form-control" placeholder="Add competition by ID" @keyup.enter="addCompetitionById($event)">
        <button class="btn btn-primary" @click="addCompetitionById($event)" type="button" id="button-addon2">Add</button>
      </div>
      <div class="btn-group">
        <button class="btn btn-outline-secondary" @click="toggleEventCreationWindow">Create Competition</button>
        <button class="btn btn-outline-secondary" @click="updateAllCompetitions">Update all competitions</button>
      </div>
    </div>
    <div v-if="showCreateEvent" class="create-event-window">
      <h5>Create Competition or Event</h5>
      <div class="input-group">
        <input type="text" v-model="newEventName" class="form-control" placeholder="Competition or event name" @keyup.enter="addCompetitionByName">
        <button class="btn btn-outline-secondary" @click="addCompetitionByName" type="button">Create</button>
        <button class="btn btn-outline-secondary" @click="showCreateEvent=false" type="button">Cancel</button>
      </div>
    </div>
    <EasyDataTable
      :headers="headers"
      :items="competitions"
      alternating>
      <template #item-createdAt="item">
        <button class="btn btn-outline-secondary btn-sm" @click=" updateCompetition(item.id)">Update</button>
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
