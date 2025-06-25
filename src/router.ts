import {createRouter, createWebHashHistory, RouteRecordRaw} from 'vue-router';
import ActivitySetupPage from './views/ActivitySetupPage.vue';
import ActivityTrackingPage from './views/ActivityTrackingPage.vue';
import ActivitySharing from './views/ActivitySharing.vue';

const routes: RouteRecordRaw[] = [
    {path: '/', redirect: '/track'},
    {path: '/setup', component: ActivitySetupPage},
    {path: '/track', component: ActivityTrackingPage},
    {path: '/share', component: ActivitySharing},
];

export default createRouter({
    history: createWebHashHistory(),
    routes,
});
