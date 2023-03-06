import { defineStore } from "pinia";
import type Fixture from "@/types/fixture";


export const useFixtureStore = defineStore({
  id: "fixtureStore",
  state: () => {
    return {
      fixtures: [] as Fixture[],
      currentFixtures: [] as Fixture[],
      competitionNames: new Set<string>()
    }
  },
  getters: {
    getFixtures(state): Fixture[] {
      return state.fixtures
    },
    getNemoFixtures(state): Fixture[] {
      return state.currentFixtures
    },
    getCompetitionName(state) {
      return state.competitionNames
    }
  },
  actions: {
    async fetchFixtures() {
      try {
        fetch(`${import.meta.env.VITE_FIXTURE_SERVICE_URL}/fixtures`)
        .then(response => response.json())
        .then( (data: Fixture[]) => {
          // we add a new field called time, this is a copy of the date field but necessary because the way vue3-easy-data-table works
          data = data.map(fixture => {
            return {...fixture, time: fixture.date}
          });

          this.fixtures = data;

          this.filterFixturesByNemo();

          this.fixtures.forEach(fixture => {
            this.competitionNames.add(fixture.competition.name);
          })
        })
      } catch (error) {
        console.log(error)
      }
    },
    filterFixturesByCompetitionName($event: Event) {
      const competitionName = ($event.target as HTMLInputElement).value;
      this.currentFixtures = this.fixtures;
      this.filterFixturesByNemo();
      if (competitionName !== 'all') {
        this.currentFixtures = this.currentFixtures.filter(fixture => fixture.competition.name === competitionName);
      }
    },
    filterFixturesByNemo() {
      this.currentFixtures = this.fixtures.filter(fixture => {
        return (fixture.homeTeam.toLowerCase().includes('nemo rangers') || fixture.awayTeam.toLowerCase().includes('nemo rangers'))
      })
    }
  }
});
