import { defineStore } from "pinia";
import type Competition from "@/types/competition";

export const useCompetitionStore = defineStore({
    id: "competitionStore",
    state: () => {
        return {
            competitions: [] as Competition[],
            editableCompetitions: [] as Competition[]
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
                .then(response => response.json())
                .then(allCompetitions => {
                    this.competitions = allCompetitions;
                    this.editableCompetitions = allCompetitions.filter((competition: Competition) => {
                         return competition.name.toLowerCase().includes('challenge') 
                         || competition.name.toLowerCase().includes('camogie') 
                         || competition.name.toLowerCase().includes('club');
                    });
                })
                .catch(error => {
                    console.error(error);
                })
        },
        async updateCompetition(competitionId: number) {
            return fetch(`${import.meta.env.VITE_FIXTURE_SERVICE_URL}/fixtures/updateFixtures/${competitionId}`)
                .then( response => response.json())
                .then( data => {
                    return data.length;
                })
                .catch(error => {
                    console.error(error);
                })
        },
        async addCompetitionById(competitionId: number) {
            return fetch(`${import.meta.env.VITE_FIXTURE_SERVICE_URL}/fixtures/fetchAndPopulateByCompetitionId/${competitionId}`)
                .then(response => response.text())
                .then( () => {this.fetchCompetitions() })
                .catch(error => {
                    console.log('competitionStore addCompetition in error catch')
                    console.error(error);
                })
        },
        async addCompetitionByName(competitionName: string) {
            return fetch(`${import.meta.env.VITE_FIXTURE_SERVICE_URL}/competition/${competitionName}`, {
                method: 'POST'
            })
                .then(response => response.json())
                .then(updatedCompetitionList => {
                    this.competitions = updatedCompetitionList;
                })
                .catch(error => {
                    console.log('addCompetitionByName throws error')
                    console.error(error);
                })
        },
        async toggleSeniorGrade(competitionId: number, seniorGrade: boolean) {
            return fetch(`${import.meta.env.VITE_FIXTURE_SERVICE_URL}/competition/${competitionId}/seniorGrade/${seniorGrade}`, {
                method: 'PATCH'
            })
                .then(response => response.json())
                .then(updatedCompetitionList => {
                    this.competitions = updatedCompetitionList;
                })
                .catch(error => {
                    console.log('toggleSeniorGrade throws error')
                    console.error(error);
                })
        }
    },
});
