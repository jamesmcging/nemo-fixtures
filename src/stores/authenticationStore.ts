import { defineStore } from "pinia";
import type User from "@/types/user";

export const useAuthenticationStore = defineStore({
    id: "authenticationStore",
    state: () => {
      return {
        _isAuthenticated: false
      }
    },
    getters: {
      isAuthenticated(state) {
        return state._isAuthenticated
      }
    },
    actions: {
        async login(email: string, password: string): Promise<boolean> {
            this._isAuthenticated = false;
            return await fetch(`${import.meta.env.VITE_FIXTURE_SERVICE_URL}/authentication/login`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({email, password})
            })
            .then(async response => {
                if (response.status === 200) {
                    this._isAuthenticated = true;
                    return true;
                } else {
                    return false;
                }
            })
            .catch(error => {
                console.error('unable to use the login end point', error);
                return false;
            })
        },
        logout() {
            this._isAuthenticated = false;
        },
        async addUser(name: string, email: string, password: string): Promise<User | boolean> {
            console.log('adduser called');
            return await fetch(`${import.meta.env.VITE_FIXTURE_SERVICE_URL}/authentication/user`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({name, email, password})
            })
            .then(response => response.json())
            .then( (user: User) => {
                if (user) {
                    return user
                } else {
                    return false;
                }
            })
            .catch(error => {
                console.error('unable to use the login end point', error);
                return false;
            })
        }
    }
});