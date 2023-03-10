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
      toDate: new Date(new Date().setDate(new Date().getDate() + 14)),
      competitionFilterName: 'all',
      showSeniorGrade: false,
      showUnderageGrade: true
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
    },
    getShowSeniorGrade(state) {
      return state.showSeniorGrade
    },
    getUnderageGrade(state) {
      return state.showUnderageGrade
    }
  },
  actions: {
    async fetchFixtures() {
      try {
        fetch(`${import.meta.env.VITE_FIXTURE_SERVICE_URL}/fixtures`)
        .then(response => response.json())
        .then( (data: Fixture[]) => {
          // we add a new field called time, this is a copy of the date field but necessary because the way vue3-easy-data-table works
          this.fixtures = data.map(fixture => {
            return {...fixture, time: fixture.date}
          });

          this.fixtures.forEach(fixture => {
            if (fixture?.competition?.name) {
              this.competitionNames.add(fixture.competition.name);
            }
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
    filterFixturesBySeniorGrade(fixtures: Fixture[]) {
      // exclude senior fixtures when toggled to hide them
      return fixtures.filter( (fixture:Fixture) => {
        if (fixture.competition.seniorGrade && !this.showSeniorGrade) {
          return false
        } else {
          return true
        }
      })
    },
    filterFixturesByUnderageGrade(fixtures: Fixture[]) {
      // exclude underage fixtures when tottle to hide them
      return fixtures.filter( (fixture:Fixture) => {
        if (!fixture.competition.seniorGrade && !this.showUnderageGrade) {
          return false
        } else {
          return true
        }
      })
    },
    setCompetitionFilter(competitionName: string) {
      console.log(competitionName, this.competitionFilterName);
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
    toggleShowGrade(grade: string) {
      if (grade === 'seniorGrade') {
        this.showSeniorGrade = !this.showSeniorGrade
      } else {
        this.showUnderageGrade = !this.showUnderageGrade
      }
      this.runFilters();
    },
    runFilters() {
      let fixtures = this.filterFixturesByNemo(this.fixtures);
      if (fixtures.length) {
        fixtures = this.filterFixturesByCompetitionName(fixtures);
        fixtures = this.filterFixturesByDate(fixtures);
        fixtures = this.filterFixturesBySeniorGrade(fixtures);
        fixtures = this.filterFixturesByUnderageGrade(fixtures);
      }
      this.currentFixtures = fixtures;
    },
    async setPitch(fixtureId: number, pitchNumber: string) {
      try {
        fetch(`${import.meta.env.VITE_FIXTURE_SERVICE_URL}/fixtures/updateFixture/${fixtureId}/pitch/${pitchNumber}`)
        .then(response => response.json())
        .then( (updatedFixture: Fixture) => {
          const fixtureToReplace = this.fixtures.find((fixture: Fixture) => updatedFixture.id === fixture.id);
          if (fixtureToReplace) {
            Object.assign(fixtureToReplace, updatedFixture);
          }
          this.runFilters();
        })
      } catch (error) {
        console.log(error)
      }
    },
    async setComment(fixtureId: number, comment: string) {
      try {
        return fetch(`${import.meta.env.VITE_FIXTURE_SERVICE_URL}/fixtures/updateFixture/${fixtureId}/comment/${comment}`)
        .then(response => response.json())
        .then( (updatedFixture: Fixture) => {
          const fixtureToReplace = this.fixtures.find((fixture: Fixture) => updatedFixture.id === fixture.id);
          if (fixtureToReplace) {
            Object.assign(fixtureToReplace, updatedFixture);
          }
          this.runFilters();
        })
      } catch (error) {
        console.log(error)
      }
    },
    async setPermission(fixtureId: number, permission: boolean, permissionStage: string): Promise<void> {
      try {
        return fetch(`${import.meta.env.VITE_FIXTURE_SERVICE_URL}/fixtures/updateFixture/${fixtureId}/${permissionStage}/${permission}`)
        .then(response => response.json())
        .then( (updatedFixture: Fixture) => {
          const fixtureToReplace = this.fixtures.find((fixture: Fixture) => updatedFixture.id === fixture.id);
          if (fixtureToReplace) {
            Object.assign(fixtureToReplace, updatedFixture);
          }
          this.runFilters();
        })
      } catch (error) {
        console.log(error)
      }
    },
    async setScore(homeScore: string, awayScore: string, fixtureId: number): Promise<void> {
      try {
        await fetch(`${import.meta.env.VITE_FIXTURE_SERVICE_URL}/fixtures/updateFixture/${fixtureId}/homeScore/${homeScore}`);
        return fetch(`${import.meta.env.VITE_FIXTURE_SERVICE_URL}/fixtures/updateFixture/${fixtureId}/awayScore/${awayScore}`)
          .then(response => response.json())
          .then( (updatedFixture: Fixture) => {
            const fixtureToReplace = this.fixtures.find((fixture: Fixture) => updatedFixture.id === fixture.id);
            if (fixtureToReplace) {
              Object.assign(fixtureToReplace, updatedFixture);
            }
            this.runFilters();
          })
      } catch (error) {
        console.log(error)
      }
    },
    async setNewFixture(competitionId: number, jsEpoch: number, homeTeam: string, awayTeam: string, venue: string): Promise<void> {
      try {
        const newFixture = {
          homeTeam: homeTeam,
          awayTeam: awayTeam,
          venue: venue,
          fixtureDate: jsEpoch ? Math.round(jsEpoch / 1000) : Math.round(new Date().getTime() / 1000),
          competitionId: competitionId
        }
        return fetch(`${import.meta.env.VITE_FIXTURE_SERVICE_URL}/fixtures`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newFixture)
        })
          .then(response => response.json())
          .then( (updatedFixturesList: Fixture[]) => {
            this.fixtures = updatedFixturesList;
            this.runFilters();
          })
      } catch (error) {
        console.log(error)
      }
    }
  }
});
