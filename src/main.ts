import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

import Vue3EasyDataTable from 'vue3-easy-data-table';
import 'vue3-easy-data-table/dist/style.css';

import type { PluginOptions } from "vue-toastification";
import { POSITION } from "vue-toastification";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

import './scss/styles.scss';
import * as bootstrap from 'bootstrap'

import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'

const toastOptions: PluginOptions = {
    position: POSITION.BOTTOM_RIGHT
};

const app = createApp(App);

app.use(Toast, toastOptions);
app.component('EasyDataTable', Vue3EasyDataTable);
app.component('VueDatePicker', VueDatePicker);
app.use(createPinia());
app.use(router);

app.mount("#app");
