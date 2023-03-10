<script setup lang="ts">
import { ref } from "vue";
import mainMenu from "./mainMenu.vue";
import { useToast } from "vue-toastification";
import { useFixtureStore } from '@/stores/fixtureStore';
import { useCompetitionStore } from '@/stores/competitionStore';
import { storeToRefs } from 'pinia';
import router from "@/router";

const toast = useToast();
const fixtureStore = useFixtureStore();
const { currentFixtures } = storeToRefs(fixtureStore);
const competitionStore = useCompetitionStore();
const { editableCompetitions } = storeToRefs(competitionStore);

const showCreateFixture = ref(false);
const newFixtureCompetitionId = ref(0);
const newFixtureDate = ref(new Date().getTime());
const newFixtureHomeTeam = ref('');
const newFixtureAwayTeam = ref('');
const newFixtureVenue = ref('');

const toggleCreateFixtureWindow = () => {
    showCreateFixture.value = !showCreateFixture.value;
}

const setNewFixtureCompetitionId = ($event: Event) => {
    newFixtureCompetitionId.value = Number(($event.target as HTMLInputElement).value);
}

const handleSaveNewFixture = ($event: Event) => {
    $event.preventDefault();
    if (newFixtureCompetitionId.value && newFixtureHomeTeam.value && newFixtureAwayTeam.value) {
        const jsEpoch = new Date(newFixtureDate.value).getTime();
        fixtureStore
            .setNewFixture(newFixtureCompetitionId.value, jsEpoch, newFixtureHomeTeam.value, newFixtureAwayTeam.value, newFixtureVenue.value)
            .then(() => {
                showCreateFixture.value = false;
                toast.success('Created the new fixture');
            })
            .catch(error => {
                console.log(error);
                showCreateFixture.value = false;
                toast.error('Failed to save the new fixture');
            });
    } else {
        toast.error('A fixture must be part of a competition. It must have a home and an away team');
    }
}

const epochToDateAndTime = (epoch: string) => {
    return new Date(Number(epoch) * 1000).toString().slice(0, 21);
}

const handleLogin = ($event: Event) => {
    router.push('/fixtures');
}
</script>

<template>
    <!-- <main-menu title="Upcoming Nemo Fixtures" show-nav="true"></main-menu> -->

    <div class="container">
        <div id="home-title" @dblclick.shift="handleLogin($event)">
            <img src="@/assets/nemo.png">
            <h1>Upcoming Nemo Fixtures</h1>
        </div>
        <div v-if="showCreateFixture" class="row justify-content-evenly" id="add-fixture-div">
            <div class="fixture-modal">
                <h2>Create new fixture</h2>
                <form v-on:submit="handleSaveNewFixture($event)">
                    <div class="form-group">
                        <label for="select-competition" class="form-label">
                            Select the competition this fixture/ event is part of. <br><i>Competitions managed by Rebel Og or Mid-Cork LGFA are managed automatically and don't need added.</i>
                        </label>
                        <select class="form-select" id="select-competition" @change="setNewFixtureCompetitionId($event)">
                            <option disabled selected>Select event/ competition</option>
                            <option v-for="competition in editableCompetitions" :value="competition.id">{{ competition.name }}</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="new-fixture-date-input" class="form-label">Which date will this happen?</label>
                        <VueDatePicker id="new-fixture-date-input" v-model="newFixtureDate"></VueDatePicker>
                    </div>
                    <div class="form-group">
                        <label for="new-fixture-home-team-input" class="form-label">Home team</label>
                        <input id="new-fixture-home-team-input" class="form-control" type="text"
                            placeholder="Name of home team. For challenge matches include age eg. Nemo LGFA U10, Douglas Football U13" v-model="newFixtureHomeTeam" />
                    </div>
                    <div class="form-group">
                        <label for="new-fixture-away-team-input" class="form-label">Away team</label>
                        <input id="new-fixture-away-team-input" class="form-control" type="text"
                            placeholder="Name of away team. For challenge matches include age eg. Nemo Camogie U15 U10, Rockies Hurling U9" v-model="newFixtureAwayTeam" />
                    </div>
                    <div class="form-group">
                        <label for="new-fixture-venue-input" class="form-label">Venue</label>
                        <input id="new-fixture-venue-input" class="form-control" type="text"
                            placeholder="Where will this happen?" v-model="newFixtureVenue" />
                    </div>
                    <div class="btn-group">
                        <button class="btn btn-secondary new-fixture-button" @click="showCreateFixture = false">Cancel</button>
                        <button class="btn btn-primary new-fixture-button" type="submit">Save</button>
                    </div>
                </form>
            </div>
        </div>
        <table class="table table-hover" id="fixture-table">
            <thead>
                <th scope="col">Date</th>
                <th scope="col">Competition</th>
                <th scope="col">Home team</th>
                <th scope="col">Away Team</th>
                <th scope="col">Venue</th>
            </thead>
            <tbody>
                <tr v-for="fixture in currentFixtures">
                    <td>{{ epochToDateAndTime(fixture.date) }}</td>
                    <td>{{ fixture.competition.name }}</td>
                    <td>{{ fixture.homeTeam }}</td>
                    <td>{{ fixture.awayTeam }}</td>
                    <td>{{ fixture.venue }}</td>
                </tr>
            </tbody>
        </table>
        <button class="btn btn-primary" @click="toggleCreateFixtureWindow()">Add fixture</button>
    </div>
</template>

<style lang="scss" scoped>
#home-title {
    display: flex;
    flex-direction: column;
    align-items: center;
    img {
        height: 10rem;
    }
}
#add-fixture-div {
    margin-top: 2rem;
    padding: 2rem 2rem 2rem 2rem;
    background-color:gainsboro;
    .btn-group {
        margin-top: 1rem;
    }
}
#fixture-table {
    margin-top: 2rem;
}
</style>
