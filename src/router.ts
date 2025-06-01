import {createRouter, createWebHistory, RouteRecordRaw} from 'vue-router';
import ActivitySetupPage from './views/ActivitySetupPage.vue';
import ActivityTrackingPage from './views/ActivityTrackingPage.vue';

const routes: RouteRecordRaw[] = [
    {path: '/', redirect: '/track'},
    {path: '/setup', component: ActivitySetupPage},
    {path: '/track', component: ActivityTrackingPage},
];

export default createRouter({
    history: createWebHistory('/activity-tracker'),
    routes,
});