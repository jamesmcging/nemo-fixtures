import { defineStore } from "pinia";
import type Fixture from "@/types/fixture";


export const useFixtureStore = defineStore({
  id: "fixtureStore",
  state: () => {
    return {
      fixtures: [] as Fixture[],
      currentFixtures: [] as Fixture[],
      competitionNames: new Set<string>(),
      fromDateAsString: '',
      fromDate: new Date(),
      toDateAsString: '',
      toDate: new Date(new Date().setDate(new Date().getDate() + 8)),
      competitionFilterName: 'all'
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
    },
    getFromDate(state) {
      return state.fromDateAsString
    },
    getToDate(state) {
      return state.toDateAsString
    },
    getCompetitionFilterName(state) {
      return state.competitionFilterName
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

          this.fixtures.forEach(fixture => {
            this.competitionNames.add(fixture.competition.name);
          })

          this.runFilters();
        })
      } catch (error) {
        console.log(error)
      }
    },
    filterFixturesByCompetitionName(fixtures: Fixture[]) {
      if (this.competitionFilterName === 'all') {
        return fixtures;
      } else {
        return fixtures.filter(fixture => fixture.competition.name === this.competitionFilterName);
      }
    },
    filterFixturesByNemo(fixtures: Fixture[]) {
      return fixtures.filter(fixture => {
        return (fixture.homeTeam.toLowerCase().includes('nemo rangers') || fixture.awayTeam.toLowerCase().includes('nemo rangers'))
      })
    },
    filterFixturesByDate(fixtures: Fixture[]) {
      const filteredFixtures = fixtures.filter((fixture: Fixture) => (new Date(Number(fixture.date)*1000).getTime() > this.fromDate.getTime()));
      return filteredFixtures.filter((fixture: Fixture) => (new Date(Number(fixture.date)*1000).getTime()) < this.toDate.getTime()); 
    },
    setCompetitionFilter(competitionName: string) {
      this.competitionFilterName = competitionName;
      this.runFilters();
    },
    setDate(date: Date, dateFilterName: string) {
      if (dateFilterName === 'fromDate') {
        this.fromDate = date;
        this.fromDateAsString = date.toISOString().slice(0,10);
      } else {
        this.toDate = date;
        this.toDateAsString = date.toISOString().slice(0,10);
      }
      this.runFilters();
    },
    runFilters() {
      let fixtures = this.filterFixturesByNemo(this.fixtures);
      fixtures = this.filterFixturesByCompetitionName(fixtures);
      fixtures = this.filterFixturesByDate(fixtures);

      this.currentFixtures = fixtures;
    }
  }
});
