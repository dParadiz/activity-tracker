<template>
  <div class="container py-5">
    <ActivityGroupList @activity-group-selected="selectGroup" :showDelete="false"/>
    <div class="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4 mb-5 mt-4">
      <div v-for="activity in activities" :key="activity.id" class="col">
        <div class="card mb-3 cursor-pointer border-success" style="max-width: 20rem;"
             @click="incrementActivity(activity.id)"
             :class="{'border-danger':activity.weight < 0}"
        >
          <div class="card-header">{{ activity.name }} ({{ activity.weight }})</div>
          <div class="card-body">
            <p class="card-text">Count: {{ activityCounts[activity.id] || 0 }}</p>
          </div>

        </div>
      </div>
    </div>

    <div class="mt-5">
      <h3 class="h3 mb-4">History</h3>
      <table v-if="trackingHistory.length" class="table table-hover">
        <thead>
        <tr>
          <th>Date</th>
          <th>Activities</th>
          <th>Total Score</th>
        </tr>
        </thead>
        <tbody v-if="trackingHistory.length">
        <tr v-for="entry in trackingHistory" :key="entry.timestamp" >
          <td>{{ new Date(entry.timestamp).toISOString().split('T')[0] }}</td>
          <td>{{ entry.activities }}</td>
          <td>{{ entry.totalScore }}</td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue'
import {loadTrackingHistory, saveTrackingEntry} from '@/services/dbService';
import ActivityGroupList from "@/components/ActivityGroupList.vue";
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