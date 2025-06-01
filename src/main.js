import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';

// Import the custom SCSS file
import '@/assets/main.scss';


const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount('#app');