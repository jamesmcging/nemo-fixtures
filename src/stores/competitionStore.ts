import { defineStore } from "pinia";
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
      fetch(`${import.meta.env.VITE_FIXTURE_SERVICE_URL}/competition`)
      .then( response => response.json() )
      .then( data => {
        this.competitions = data;
      })
      .catch(error => {
        console.error(error);
      })
    },
    async updateCompetition(competitionId: number) {
      return fetch(`${import.meta.env.VITE_FIXTURE_SERVICE_URL}/fixtures/updateFixtures/${competitionId}`)
      .then(response => response.text())
      .catch(error => {
        console.error(error);
      })
    },
    async addCompetition(competitionId: number) {
      return fetch(`${import.meta.env.VITE_FIXTURE_SERVICE_URL}/fixtures/fetchAndPopulateByCompetitionId/${competitionId}`)
      .then(response => response.text())
      .catch(error => {
        console.log('competitionStore addCompetition in error catch')
        console.error(error);
      })
    }
  }
});
