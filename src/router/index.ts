import { createRouter, createWebHistory } from "vue-router";
import home from "../components/home.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: home,
    },
    {
      path: "/fixtures",
      name: "fixtures",
      component: () => import("../components/fixtures.vue"),
    },
    {
      path: "/competitions",
      name: "competitions",
      component: () => import("../components/competitions.vue"),
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../components/login.vue"),
    },
  ],
});

export default router;
