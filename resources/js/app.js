import { createApp } from 'vue';
import App from './VueApp.vue';
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
import './bootstrap';
import '../css/app.css';

const app = createApp(App);

// Register Vue Toastification
app.use(Toast); // Register the Toast plugin

app.mount('#app');