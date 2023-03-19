import type Competition from "./competition";

export default interface Fixture {
    id: number,
    externalId: number,
    homeTeam: string,
    awayTeam: string,
    venue: string,
    pitch: string,
    date: number,
    homeScore: string,
    awayScore: string,
    referee_name: string,
    permission_sought: boolean,
    permission_obtained: boolean,
    createAt: string,
    updatedAt: string,
    competitionId: number,
    competition: Competition
}