<template>
  <div class="max-w-4xl mx-auto p-5">
    <h2 class="text-2xl font-bold mb-4">Activity Tracking</h2>
    <ActivityGroup @activity-group-selected="selectGroup"/>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
      <div v-for="activity in activities" :key="activity.id" class="border border-gray-200 rounded-lg p-4 text-center">
        <h3 class="text-lg font-semibold">{{ activity.name }}</h3>
        <p class="text-3xl my-3">Count: {{ activityCounts[activity.id] || 0 }}</p>
        <button @click="incrementActivity(activity.id)"
                class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">Done
        </button>
      </div>
    </div>

    <div class="mt-8">
      <h3 class="text-xl font-bold mb-4">History</h3>
      <table v-if="trackingHistory.length" class="w-full border-collapse">
        <thead>
        <tr>
          <th class="border border-gray-200 bg-gray-50 p-2 text-left">Date</th>
          <th class="border border-gray-200 bg-gray-50 p-2 text-left">Activities</th>
          <th class="border border-gray-200 bg-gray-50 p-2 text-left">Total Score</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="entry in trackingHistory" :key="entry.timestamp" v-if="trackingHistory.length">
          <td class="border border-gray-200 p-2">{{ new Date(entry.timestamp).toISOString().split('T')[0] }}</td>
          <td class="border border-gray-200 p-2">{{ entry.activities }}</td>
          <td class="border border-gray-200 p-2">{{ entry.totalScore }}</td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue'
import {loadTrackingHistory, saveTrackingEntry} from '@/services/dbService';
import ActivityGroup from "@/components/ActivityGroup.vue";
import {defineStore, storeToRefs} from 'pinia'

const trackingHistory = ref([]);

onMounted(async () => {

});

const useActivityStore = defineStore('activity-tracking', {
  state: () => ({
    name: '',
    activities: [],
    history: [],
    activityCounts: {}
  }),
  actions: {
    incrementActivityCount(id) {
      if (!this.activityCounts[id]) {
        this.activityCounts[id] = 0
      }
      this.activityCounts[id]++
    },
    async resetStore() {
      this.name = ''
      this.activities = []
      this.activityCounts = {}
    },
    async loadFrom(group) {
      await this.resetStore();
      this.name = group.name;
      this.activities = group.activities.map((activity, i) => ({id: i, ...activity}));
    }
  },
  getters: {
    totalScore: (state) => {
      return state.activities.reduce((total, activity) => {
        return total + (state.activityCounts[activity.id] || 0) * activity.weight
      }, 0)
    }
  }
})
const store = useActivityStore()
const {activities, activityCounts} = storeToRefs(store)


const updateHistory = async () => {

  const activitySummary = activities.value.map(activity =>
      `${activity.name}: ${activityCounts.value[activity.id] || 0}`
  ).join(', ');

  const entry = {
    name: store.name,
    timestamp: new Date().toISOString().split('T')[0],
    activities: activitySummary,
    totalScore: calculateTotalScore.value,
  };

  // Add entry to the database via service
  await saveTrackingEntry(entry);

  // Update local history
  const existingEntryIndex = trackingHistory.value.findIndex(item => item.timestamp === entry.timestamp);
  if (existingEntryIndex !== -1) {
    trackingHistory.value[existingEntryIndex] = entry;
  } else {
    trackingHistory.value.push(entry);
  }
};

const incrementActivity = (id) => {
  activityCounts.value[id] = (activityCounts.value[id] || 0) + 1
  updateHistory();
}


const selectGroup = async (group) => {
  await store.loadFrom(group);
  const data = await loadTrackingHistory(group.name);
  if (data) {
    trackingHistory.value = [];
    const today = new Date().toISOString().split('T')[0];

    if (Array.isArray(data)) {
      data.forEach(entry => {
        trackingHistory.value.push(entry);

        if (entry.timestamp === today) {
          activityCounts.value = entry.activities.split(', ').reduce((acc, activity) => {
            const [name, count] = activity.split(': ');
            const activityId = activities.value.find(a => a.name === name)?.id;
            if (activityId !== undefined) {
              acc[activityId] = parseInt(count);
            }
            return acc;
          }, {});
        }
      });
    }
  }
}

const calculateTotalScore = computed(() => {
  if (!Array.isArray(activities.value)) return 0;

  return activities.value.reduce((total, activity) => {
    return total + (activityCounts.value[activity.id] || 0) * activity.weight
  }, 0)
})
</script>

<style scoped>

</style>