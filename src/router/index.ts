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
      path: "/competitions",
      name: "competitions",
      component: () => import("../components/competitions.vue"),
    },
    {
      path: "/fixtures",
      name: "fixtures",
      component: () => import("../components/fixtures.vue"),
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../components/login.vue"),
    },
  ],
});

// router.beforeEach(async(to, from) => {
//   console.log(`from: ${from}`, from)
//   console.log(`to: ${to}`, to)
//   return true;
// })

export default router;
