<script setup lang="ts">
  import { useCompetitionStore } from "@/stores/competitionStore";
  import { storeToRefs } from "pinia";
  import { onMounted } from "vue";
  import mainMenu from "./mainMenu.vue"
  import type { Header } from "vue3-easy-data-table";
  import { useToast } from "vue-toastification";
  const toast = useToast();

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

  function addCompetition($event: Event) {
    const competitionId = Number(($event.target as HTMLInputElement).value);
    toast(`Fetching fixtures for competition ${competitionId}`);
    if (competitionId > 100000) {
      competitionStore.addCompetition(competitionId)
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

  const headers: Header[] = [
    { text: "Id", value: "id"},
    { text: "Name", value: "name", sortable: true},
    { text: "Last updated", value: "updatedAt"},
    { text: "Actions", value: "createdAt"}
  ];
</script>

<template>
  <main-menu title="Competitions"></main-menu>
  <div id="content">
    <div id="competition-actions">
      <label>
        Add new competion
        <input id="new-competition-id" type="number" placeholder="competition ID" @keyup.enter="addCompetition($event)"/>
      </label>
    </div>
    <EasyDataTable
      :headers="headers"
      :items="competitions"
      alternating>
      <template #item-createdAt="item">
        <button @click=" updateCompetition(item.id)">Update</button>
      </template>
    </EasyDataTable>
  </div>
</template>

<style scoped>
#content {
  margin-top: 1rem;
}
#competition-actions {
  margin-bottom: 1rem;
}
</style>
