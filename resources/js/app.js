import { createApp } from 'vue';
import App from './VueApp.vue';
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
import './bootstrap';
import '../css/app.css';

const app = createApp(App);

// Register Vue Toastification
app.use(Toast, {
    position: "top-right",
    timeout: 5000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: false,
    closeButton: "button",
    icon: true,
    rtl: false
});

app.mount('#app');