<script setup lang="ts">
import MainMenu from './mainMenu.vue';
import type Fixture from '../types/fixture';
import { onMounted } from "vue";
import { useFixtureStore } from '@/stores/fixtureStore';
import type { Header } from "vue3-easy-data-table";
import { useToast } from "vue-toastification";
import { storeToRefs } from 'pinia';
import { utils } from "xlsx";
import XLSX from "xlsx";
  const toast = useToast();
  const fixtureStore = useFixtureStore();
  const { currentFixtures: currentFixtures, competitionNames } = storeToRefs(fixtureStore);
  // const excel_download_url = import.meta.env.VITE_FIXTURE_SERVICE_URL + '/fixtures/excel';

  onMounted(() => {
    fixtureStore.fetchFixtures();
  })

  const headers: Header[] = [
    { text: "Date", value: "date", sortable: true},
    { text: "Time", value: "time"},
    { text: "Competition", value: "competition.name"},
    { text: "Home Team", value: "homeTeam"},
    { text: "Away Team", value: "awayTeam"},
    { text: "Venue", value: "venue"},
    { text: "Pitch", value: "pitch"},
    { text: "Referee", value: "referee_name"},
    { text: "Permission send to board", value: "permission_sought"},
    { text: "Score", value: "score"},
  ];
  
  // const getFormatedDate = (epoch: number) => {
  //   const date = new Date(epoch * 1000);
  //   let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date);
  //   let mo = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(date);
  //   let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date);

  //   return `${da}/${mo}/${ye}`;
  // }

  const getFormatedTime = (epoch: number) => {
    const date = new Date(epoch * 1000);
    let hour = new Intl.DateTimeFormat('en', { hour: 'numeric', hour12: false }).format(date);
    let minutes = new Intl.DateTimeFormat('en', { minute: '2-digit' }).format(date);
    if (minutes === '0') minutes = '00'

    return `${hour}:${minutes}`;
  }

  const getExcel = () => {
    toast('Generating excel, this will appear in your downloads folder');
    const data = currentFixtures.value.map((fixture: Fixture) => {
      return {
        date: getFormatedDate(Number(fixture.date)),
        time: new Date(Number(fixture.date)*1000).toLocaleTimeString(),
        competition: fixture.competition.name,
        homeTeam: fixture.homeTeam,
        awayTeam: fixture.awayTeam,
        venue: fixture.venue,
        pitch: fixture.pitch,
        referee: fixture.referee_name,
        permission_sought: fixture.permission_sought,
        score: getFormatedScore(fixture.homeScore, fixture.awayScore)
      }
    });
    const workbook = utils.book_new();
    const sheet = utils.json_to_sheet( data );
    utils.book_append_sheet(workbook, sheet);

    XLSX.writeFileXLSX(workbook, getFileName());
  }

  const getFormatedScore = (homeScore: string, awayScore: string) => {
    return (homeScore && awayScore) ?  `${homeScore} : ${awayScore}` : '';
  }

  const getFormatedDate = (epoch: number) => {
    const date = new Date(epoch * 1000);
    let year = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date);
    let month = new Intl.DateTimeFormat('en', { month: 'short' }).format(date);
    let day = new Intl.DateTimeFormat('en', { day: 'numeric' }).format(date);
    let dayName = new Intl.DateTimeFormat('en', { weekday: 'short' }).format(date);

    return `${dayName} ${month} ${day}`;
  }

  const getFileName = () => {
    const date = new Date();
    let year = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date);
    let monthAsNumber = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(date);
    let dayOfMonth = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date);
    
    return `nemo-fixtures-${year}-${monthAsNumber}-${dayOfMonth}.xlsx`;
  }

  
</script>

<template>
  <main-menu title="Fixtures"></main-menu>
  <div id="content">
    <div class="fixture-actions">  
      <select name="filterFixturesByCompetitionName" @change="fixtureStore.filterFixturesByCompetitionName($event)">
        <option value="all">All competitions</option>
        <option v-for="competitionName in competitionNames" :value="competitionName">{{ competitionName }}</option>
      </select>
      <button @click="getExcel()">Download excel</button>
    </div>
    <EasyDataTable
      :headers="headers"
      :items="currentFixtures"
      alternating
    >
      <template #item-date="item">
        {{ getFormatedDate(item.date) }}
      </template>
      <template #item-homeTeam="item">
        <template v-if="item.homeTeam.toLowerCase().includes('nemo rangers')"><span class="bold">{{ item.homeTeam }}</span></template>
        <template v-else>{{ item.homeTeam }}</template>
      </template>
      <template #item-awayTeam="item">
        <template v-if="item.awayTeam.toLowerCase().includes('nemo rangers')"><span class="bold">{{ item.awayTeam }}</span></template>
        <template v-else>{{ item.awayTeam }}</template>
      </template>
      <template #item-time="item">
        {{ getFormatedTime(item.time) }}
      </template>
      <template #item-score="item">
        {{ item.homeScore }} : {{ item.awayScore }}
      </template>
      <template #expand="item">
        {{ item.comment }}
      </template>
    </EasyDataTable>
  </div>
</template>

<style scoped>
#content {
  margin-top: 1rem;
}
.bold {
  font-weight: bold;
}
.fixture-actions{
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}
</style>
