import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { router } from './router';
import './styles/main.css';

const app = createApp(App);

const pinia = createPinia();
app.use(pinia);
app.use(router);

// Initialize persisted auth session
import { useAuthStore } from './stores/auth';
useAuthStore().initAuth();

app.mount('#app');

