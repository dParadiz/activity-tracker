import {createRouter, createWebHistory, RouteRecordRaw} from 'vue-router';
import ActivitySetupPage from './pages/ActivitySetupPage.vue';
import ActivityTrackingPage from './pages/ActivityTrackingPage.vue';

const routes: RouteRecordRaw[] = [
    {path: '/', redirect: '/track'},
    {path: '/setup', component: ActivitySetupPage},
    {path: '/track', component: ActivityTrackingPage},
];

export default createRouter({
    history: createWebHistory(),
    routes,
});