import { defineStore } from "pinia";
import { configuration } from "@/configuration";
import type Competition from "@/types/competition";

export const useCompetitionStore = defineStore({
  id: "competitionStore",
  state: () => {
    return {
      competitions: []
    }
  },
  getters: {
    getCompetitions(state): Competition[] {
      return state.competitions
    }
  },
  actions: {
    async fetchCompetitions() {
      fetch(`${configuration.dev.url}/competition`)
      .then( response => response.json() )
      .then( data => {
        this.competitions = data;
      })
      .catch(error => {
        console.error(error);
      })
    },
    async updateCompetition(competitionId: number) {
      return fetch(`${configuration.dev.url}/fixtures/updateFixtures/${competitionId}`)
      .then(response => response.text())
      .catch(error => {
        console.error(error);
      })
    },
    async addCompetition(competitionId: number) {
      return fetch(`${configuration.dev.url}/fixtures/fetchAndPopulateByCompetitionId/${competitionId}`)
      .then(response => response.text())
      .catch(error => {
        console.log('competitionStore addCompetition in error catch')
        console.error(error);
      })
    }
  }
});
