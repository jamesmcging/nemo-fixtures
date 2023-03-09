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
  const { currentFixtures: currentFixtures, competitionNames, toDateAsString, fromDateAsString, showSeniorGrade, showUnderageGrade } = storeToRefs(fixtureStore);

  onMounted(() => {
    fixtureStore.fetchFixtures();
    fixtureStore.setDate(new Date(), 'fromDate');
    const date = new Date();
    fixtureStore.setDate(new Date(date.setDate(date.getDate() + 14)), 'toDate');
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
    { text: "Permission sought from board", value: "permission_sought"},
    { text: "Score", value: "score"},
  ];

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

  const setFixtureStoreDateFilter = ($event: Event, dateFilterName: string) => {
    const date = new Date(($event.target as HTMLInputElement).value);
    fixtureStore.setDate(date, dateFilterName);
  }
  
  const setFixtureStoreCompetitionFilter = ($event: Event) => {
    fixtureStore.setCompetitionFilter(($event.target as HTMLInputElement).value);
  }

  const getGradeButtonClass = (grade: string) => {
    if (grade === 'seniorGrade' && showSeniorGrade.value) {
      return 'btn btn-secondary';
    } else if (grade === 'seniorGrade' && !showSeniorGrade.value) {
      return 'btn btn-outline-secondary';
    } else if (grade === 'underageGrade' && showUnderageGrade.value) {
      return 'btn btn-secondary';
    } else if (grade === 'underageGrade' && !showUnderageGrade.value) {
      return 'btn btn-outline-secondary';
    }
  }

  const handlePitchSelection = ($event: Event, fixtureId: number) => {
    const pitch = ($event.target as HTMLInputElement).value;
    fixtureStore.setPitch(fixtureId, pitch);
  }

  const handleFixtureComment = ($event: Event, fixtureId: number) => {
    const comment = ($event.target as HTMLInputElement).value;
    fixtureStore.setComment(fixtureId, comment).then( () => {
      toast.success('Updated commment on fixture');
    });
  }
</script>

<template>
  <main-menu title="Fixtures"></main-menu>
  <div id="content" class="container">
    
    <div class="row justify-content-between fixture-actions">
      <div class="col">
        <select class="form-select" name="filterFixturesByCompetitionName" @change="setFixtureStoreCompetitionFilter($event)">
          <option value="all">All competitions</option>
          <option v-for="competitionName in competitionNames" :value="competitionName">{{ competitionName }}</option>
        </select>
      </div>
      <div class="col">
        <input class="form-control" type="date" v-model="fromDateAsString" @change="setFixtureStoreDateFilter($event, 'fromDate')">
      </div>
      <div class="col">
        <input class="form-control" type="date" v-model="toDateAsString" @change="setFixtureStoreDateFilter($event, 'toDate')">
      </div>
      <div class="col">
        <div class="btn-group">
        <button :class="getGradeButtonClass('seniorGrade')" @click="fixtureStore.toggleShowGrade('seniorGrade')">Senior</button>
        <button :class="getGradeButtonClass('underageGrade')" @click="fixtureStore.toggleShowGrade('underage')">Underage</button>
      </div>
      </div>
      <div class="col">
        <button class="float-end btn btn-outline-primary" @click="getExcel()">Download excel</button>
      </div>
    </div>

    <EasyDataTable
      :headers="headers"
      :items="currentFixtures"
      alternating
    >
      <template #item-date="item">
        {{ getFormatedDate(item.date) }}
      </template>
      <template #item-time="item">
        {{ getFormatedTime(item.time) }}
      </template>
      <template #item-competition.name="item">
        <b v-show="item.competition.seniorGrade">Senior </b>{{ item.competition.name }}
      </template>
      <template #item-homeTeam="item">
        <template v-if="item.homeTeam.toLowerCase().includes('nemo rangers')"><span class="bold">{{ item.homeTeam }}</span></template>
        <template v-else>{{ item.homeTeam }}</template>
      </template>
      <template #item-awayTeam="item">
        <template v-if="item.awayTeam.toLowerCase().includes('nemo rangers')"><span class="bold">{{ item.awayTeam }}</span></template>
        <template v-else>{{ item.awayTeam }}</template>
      </template>
      <template #item-pitch="item">
        <select class="input-control" v-model="item.pitch" @change="handlePitchSelection($event, item.id)">
          <option disabled value="">Select pitch</option>
          <option :value="0">TBC</option>
          <option :value="1">Pitch 1</option>
          <option :value="2">Pitch 2</option>
          <option :value="3">Pitch 3</option>
          <option :value="4">Pitch 4</option>
          <option :value="5">Away</option>
          <option :value="6">Not applicable</option>
        </select>
      </template>
      <template #item-score="item">
        {{ item.homeScore }} : {{ item.awayScore }}
      </template>
      <template #expand="item">
          <input type="text" class="form-control comment-input" placeholder="Comment on the fixture" @keyup.enter="handleFixtureComment($event, item.id)" :value="item.comment">
      </template>
    </EasyDataTable>
  </div>
</template>

<style lang="scss" scoped>
#content {
  margin-top: 1rem;
  .fixture-actions{
    margin-bottom: 1rem;
  }
  .comment-input{
    margin: 0;
    border: none;
  }
}
.bold {
  font-weight: bold;
}

</style>
