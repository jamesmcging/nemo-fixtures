<script setup lang="ts">
import MainMenu from './mainMenu.vue';
import type Fixture from '../types/fixture';
import { onMounted, ref } from "vue";
import type { Header } from "vue3-easy-data-table";
import { useToast } from "vue-toastification";
import { storeToRefs } from 'pinia';
import { utils } from "xlsx";
import XLSX from "xlsx";
import { useFixtureStore } from '@/stores/fixtureStore';
import { useCompetitionStore } from '@/stores/competitionStore';

  const toast = useToast();
  const fixtureStore = useFixtureStore();
  const competitionStore = useCompetitionStore();
  const { competitions } = storeToRefs(competitionStore);
  const { getCurrentFixtures, competitionNames, toDateAsString, fromDateAsString, showSeniorGrade, showUnderageGrade, competitionFilterName } = storeToRefs(fixtureStore);
  
  const showSetScore = ref(false);
  const homeScore = ref('');
  const homeTeam = ref('');
  const awayScore = ref('');
  const awayTeam = ref('');
  const currentFixtureId = ref(0);

  const editReferee = ref(false);
  const editVenue = ref(false);

  onMounted(() => {
    competitionStore.fetchCompetitions();
    fixtureStore.fetchFixtures();
    const date = new Date();
    fixtureStore.setDate(new Date(date.setDate(date.getDate() - 7)), 'fromDate');
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
    { text: "Permission sought", value: "permission_sought"},
    { text: "Permission obtained", value: "permission_obtained"},
    { text: "Score", value: "score"},
  ];

  const getFormatedTime = (epoch: number) => {
    const date = new Date(epoch);
    let hour = new Intl.DateTimeFormat('en', { hour: 'numeric', hour12: false }).format(date);
    let minutes = new Intl.DateTimeFormat('en', { minute: '2-digit' }).format(date);
    if (minutes === '0') minutes = '00'

    return `${hour}:${minutes}`;
  }

  const getPitch = (pitchAsNumber: string) => {
    switch (pitchAsNumber) {
        case '1':
        case '2':
        case '3':
        case '4':
            return `pitch ${pitchAsNumber}`
        case '5':
            return 'away'
        case '6':
        default:
            return 'n/a'
    }
}
  const getExcel = () => {
    toast('Generating excel, this will appear in your downloads folder');
    const data = getCurrentFixtures.value.map((fixture: Fixture) => {
      return {
        date: getFormatedDate(Number(fixture.date)),
        time: new Date(fixture.date).toLocaleTimeString(),
        competition: fixture.competition.name,
        homeTeam: fixture.homeTeam,
        awayTeam: fixture.awayTeam,
        venue: fixture.venue,
        pitch: getPitch(fixture.pitch),
        referee_name: fixture.referee_name,
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
    const date = new Date(epoch);
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

  const handlePermissionChange = ($event: Event, fixtureId: number, permissionStage: string) => {
    const permission = ($event.target as HTMLInputElement).checked;
    fixtureStore.setPermission(fixtureId, permission, permissionStage).then( () => {
      toast.success(`Updated ${permissionStage} on fixture`);
    });
  }

  const handleScore = (fixture: Fixture) => {
    homeTeam.value = fixture.homeTeam;
    homeScore.value = fixture.homeScore;
    awayTeam.value = fixture.awayTeam;
    awayScore.value = fixture.awayScore;
    currentFixtureId.value = fixture.id;
    showSetScore.value = true;
  }

  const saveScore = () => {
    fixtureStore.setScore(homeScore.value, awayScore.value, currentFixtureId.value)
    .then( () => {
      toast.success('Set the score');
      showSetScore.value = false;
    })
    .catch( err => {
      toast.error('Unable to set the score');
      showSetScore.value = false;
    })
  }

  const toggleRefereeEdit = () => {
    editReferee.value = !editReferee.value;
  }

  const handleRefereeEdit = ($event: Event, fixtureId: number) => {
    const newRefereeName = ($event.target as HTMLInputElement).value;
    editReferee.value = false;
    fixtureStore.setReferee(fixtureId, newRefereeName).then( () => {
      toast.success('Referee updated')
    }).catch(error => {
      toast.error('Unable to update the referee')
      console.log('Error thrown while updating the referee', error);
    })
  }

  const toggleVenueEdit = () => {
    editVenue.value = !editVenue.value;
  }

  const handleVenueEdit = ($event: Event, fixtureId: number) => {
    const newVenue = ($event.target as HTMLInputElement).value;
    editVenue.value = false;
    fixtureStore.setVenue(fixtureId, newVenue).then( () => {
      toast.success('Venue updated')
    }).catch(error => {
      toast.error('Unable to update the venue')
      console.log('Error thrown while updating the venue', error);
    })
  }

  const saveFixture = (event: Event, updatedFixture: Fixture) => {
    event.preventDefault();
    toast.info(`Saving fixture edits`);
    fixtureStore.saveFixtureEdits(updatedFixture)
      .then( arrUpdatedFields => {
        toast.success(`Updated field(s): ${arrUpdatedFields?.join(', ')}`);
    })
    .catch(() => {
      toast.error(`Unable to save edited fixture`);
    });
  }
  const handleDateSelection = (selectedDate: Date, fixtureId: number) => {
    fixtureStore.setCurrentFixtureDate(fixtureId, selectedDate);
  }
</script>

<template>
  <main-menu title="Fixtures" show-nav="true"></main-menu>
  <div id="content">

    <div class="row justify-content-between fixture-actions">
      <div class="col">
        <select class="form-select" name="filterFixturesByCompetitionName" @change="setFixtureStoreCompetitionFilter($event)" v-model="competitionFilterName">
          <option value="all">All competitions</option>
          <option v-for="competition in competitions" :value="competition.name">{{ competition.name }}</option>
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
        <button :class="getGradeButtonClass('seniorGrade')" @click="fixtureStore.toggleShowGrade('seniorGrade')">Adult</button>
        <button :class="getGradeButtonClass('underageGrade')" @click="fixtureStore.toggleShowGrade('underage')">Underage</button>
      </div>
      </div>
      <div class="col">
        <button class="btn btn-outline-secondary" @click="getExcel()">Download</button>
      </div>
    </div>

    <div v-if="showSetScore">
      <div class="fixture-modal">
        <div class="form-floating mb-2">
          <input type="text" class="form-control" id="home-score-input" placeholder="Home team score eg 4-12" v-model="homeScore" autofocus>
          <label for="home-score-input">{{ homeTeam }} score</label>
        </div>
        <div class="form-floating mb-1">
          <input type="text" class="form-control" id="away-score-input" placeholder="Away team score" v-model="awayScore">
          <label for="away-score-input">{{ awayTeam }} score</label>
        </div>
        <div class="d-flex justify-content-center p-2">
          <div class="btn-group">
            <button class="btn btn-primary" @click="saveScore()">Save</button>
            <button class="btn btn-warning" @click="showSetScore=false">Cancel</button>
          </div>
        </div>
      </div>
    </div>

    <EasyDataTable
      :headers="headers"
      :items="getCurrentFixtures"
      alternating
    >
      <template #item-date="item">
        {{ getFormatedDate(item.date) }}
      </template>
      <template #item-time="item">
        {{ getFormatedTime(item.date) }}
      </template>
      <template #item-competition.name="item">
        <b v-show="item.competition.seniorGrade">Adult </b>{{ item.competition.name }}
      </template>
      <template #item-homeTeam="item">
        <template v-if="item.homeTeam.toLowerCase().includes('nemo rangers')"><span class="bold">{{ item.homeTeam }}</span></template>
        <template v-else>{{ item.homeTeam }}</template>
      </template>
      <template #item-awayTeam="item">
        <template v-if="item.awayTeam.toLowerCase().includes('nemo rangers')"><span class="bold">{{ item.awayTeam }}</span></template>
        <template v-else>{{ item.awayTeam }}</template>
      </template>
      <template #item-venue="item">
        <span v-if="!editVenue" @dblclick="toggleVenueEdit()">
          <span v-if="item.venue">{{ item.venue }}</span>
          <span v-else><i class="bi-pencil"></i> </span>
        </span>
        <input type="text" class="form-control" v-if="editVenue" v-model="item.venue"  @keyup.enter="handleVenueEdit($event, item.id)" placeholder="Venue">
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
      <template #item-referee_name="item">
        <span v-if="!editReferee" @dblclick="toggleRefereeEdit()">
          <span v-if="item.referee_name">{{ item.referee_name }}</span>
          <span v-else><i class="bi-pencil"></i> </span>
        </span>
        <input type="text" class="form-control" v-if="editReferee" v-model="item.referee_name"  @keyup.enter="handleRefereeEdit($event, item.id)" placeholder="Referee name">
      </template>
      <template #item-permission_sought="item">
        <input type="checkbox" v-model="item.permission_sought" @click="handlePermissionChange($event, item.id, 'permission_sought')">
      </template>
      <template #item-permission_obtained="item">
        <input type="checkbox" v-model="item.permission_obtained" @click="handlePermissionChange($event, item.id, 'permission_obtained')">
      </template>
      <template #item-score="item">
        <span @click="handleScore(item)">{{ item.homeScore }} : {{ item.awayScore }}</span>
      </template>
      <template #expand="item">

        <form @submit="saveFixture($event, item)">
          <h3>Edit Fixture</h3>
          <div class="mb-3 row">
            <div class="col">
              <label for="fixture-homeTeam" class="form-label">Home Team</label>
            <input type="text" class="form-control" id="fixture-homeTeam" placeholder="Home team" v-model="item.homeTeam" disabled>
            </div>
            <div class="col">
              <label for="fixture-awayTeam" class="form-label">Away Team</label>
            <input type="text" class="form-control" id="fixture-awayTeam" placeholder="Away team" v-model="item.awayTeam" disabled>
            </div>
          </div>
          <div class="row">
            <div class="col">
              <label for="fixture-home-score" class="form-label">Home score*</label>
              <input type="text" class="form-control" id="fixture-home-score" placeholder="Home score" v-model="item.homeScore">
            </div>
            <div class="col">
              <label for="fixture-away-score" class="form-label">Away score*</label>
              <input type="text" class="form-control" id="fixture-away-score" placeholder="Away score" v-model="item.awayScore">
            </div>
          </div>
          <div class="mb-3">
            <label for="fixture-date" class="form-label">Date and time</label>
            <VueDatePicker id="fixture-date" v-model="item.date" format="dd MMM yyyy HH:mm" @update:model-value="handleDateSelection($event, item.id)"></VueDatePicker>
          </div>
          <div class="mb-3">
            <label for="fixture-venue" class="form-label">Venue*</label>
            <input type="text" class="form-control" id="fixture-venue" placeholder="Where will the event take place?" v-model="item.venue">
          </div>
          <div class="mb-3">
            <label for="fixture-pitch" class="form-label">Pitch</label>
            <select class="form-select" v-model="item.pitch">
                <option disabled value="">Select pitch</option>
                <option :value="0">TBC</option>
                <option :value="1">Pitch 1</option>
                <option :value="2">Pitch 2</option>
                <option :value="3">Pitch 3</option>
                <option :value="4">Pitch 4</option>
                <option :value="5">Away</option>
                <option :value="6">Not applicable</option>
            </select>
          </div>
          <div class="mb-3">
            <label for="fixture-referee" class="form-label">Referee*</label>
            <input type="text" class="form-control" id="fixture-referee" placeholder="Who will referee the match" v-model="item.referee_name">
          </div>
          <div class="row">
            <div class="col">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" v-model="item.permission_sought" id="fixture-permission_sought">
                <label class="form-check-label" for="fixture-permission_sought">
                  Permission Sought
                </label>
              </div>
            </div>
            <div class="col">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" v-model="item.permission_obtained" id="fixture-permission_obtained">
                <label class="form-check-label" for="fixture-permission_obtained">
                  Permission Obtained
                </label>
              </div>
            </div>
          </div>
          <div class="mb-3">
            <label for="fixture-comment" class="form-label">Comment</label>
            <textarea class="form-control" id="fixture-comment" rows="3" v-model="item.comment"></textarea>
          </div>
          <div class="mb-3">
              <button class="btn btn-primary" type="submit" @click="saveFixture($event, item)">Save</button>
          </div>
          <p>* items marked with an asterix will be over-written whenever a competition is updated.</p>
        </form>

      </template>
    </EasyDataTable>
  </div>
</template>

<style lang="scss" scoped>
@import "bootstrap-icons/font/bootstrap-icons.css";
#content {
  margin-top: 1rem;
  .fixture-actions{
    margin-bottom: 1rem;
  }

  .fixture-modal {
    background-color:beige;
    min-height: 5rem;
    padding: 1rem 15rem 1rem 15rem;
  }

  .comment-input{
    margin: 0;
    border: none;
  }

  .new-fixture-button {
    margin-top: 1rem;
  }
}
.bold {
  font-weight: bold;
}
</style>
