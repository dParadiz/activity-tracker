<template>
  <div class="max-w-4xl mx-auto p-5">
    <ActivityGroup ref="activityGroupRef" @activity-group-selected="selectGroup" class="mb-5"/>

    <form @submit.prevent="addActivity" class="flex flex-col gap-1.5 mb-5">
      <div class="grid grid-cols-1 gap-4 w-full">
        <div class="p-2 col-span-1 flex items-center">
          <label for="groupName" class="mr-2">Name:</label>
          <input
              id="groupName"
              v-model="store.name"
              type="text"
              required
              class="px-2 py-1.5 border border-gray-300 rounded flex-1"
          />
        </div>

        <div class="p-2 col-span-1">
          <div v-if="activities.length" class="activities-list">
            <ul class="list-none p-0">
              <li v-for="activity in activities" :key="activity.id"
                  class="flex justify-between items-center p-2.5 border-b border-gray-100">
                {{ activity.name }} (Weight: {{ activity.weight }})
                <button @click="removeActivity(activity.id)"
                        class="px-4 py-2 bg-red-500 text-white border-none rounded hover:bg-red-600">Remove
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-4 p-2">
          <div class="flex flex-col">
            <label for="activityName" class="mb-1">Activity Name:</label>
            <input
                id="activityName"
                v-model="newActivity.name"
                type="text"
                required
                class="px-2 py-1.5 border border-gray-300 rounded"
            />
          </div>
          <div class="flex flex-col">
            <label for="activityWeight" class="mb-1">Weight:</label>
            <input
                id="activityWeight"
                v-model.number="newActivity.weight"
                type="number"
                step="1"
                required
                class="px-2 py-1.5 border border-gray-300 rounded"
            />
          </div>
          <div class="flex items-end">
            <button type="submit" class="px-4 py-2 bg-green-500 text-white border-none rounded hover:bg-green-600">Add
              Activity
            </button>
          </div>
        </div>

        <div class="p-2">
          <button type="button" @click="saveActivities" :disabled="!store.name"
                  class="mt-4 px-4 py-2 bg-green-500 text-white border-none rounded hover:bg-green-600 disabled:bg-gray-400">
            Save activity group
          </button>
        </div>
      </div>
    </form>

  </div>
</template>

<script setup>
import {onMounted, ref} from 'vue'
import {defineStore, storeToRefs} from 'pinia'
import ActivityGroup from "@/components/ActivityGroup.vue";

const activityGroupRef = ref(null)

const useActivityStore = defineStore('activities-creation', {
  state: () => ({
    name: '',
    activities: []
  }),
  actions: {
    async addActivity(activity) {
      const newActivity = {
        id: Date.now(),
        ...activity
      }
      this.activities.push(newActivity)

    },
    async removeActivity(id) {
      this.activities = this.activities.filter(a => a.id !== id)
    },
    async resetStore() {
      this.name = ''
      this.activities = []
    },

    async loadFrom(group) {
      await this.resetStore();
      this.name = group.name;
      group.activities.forEach((activity, i) => this.activities.push({id: i, ...activity}))
    }
  }
})

const store = useActivityStore()
const {activities} = storeToRefs(store);


onMounted(async () => {

})

const selectGroup = async (group) => {
  await store.loadFrom(group);
}


const newActivity = ref({
  name: '',
  weight: 0
})

const addActivity = () => {
  store.addActivity({
    name: newActivity.value.name,
    weight: newActivity.value.weight
  })
  newActivity.value.name = ''
  newActivity.value.weight = 0
}

const removeActivity = (id) => {
  store.removeActivity(id)
}

const saveActivities = async () => {

  const activitiesArray = Array.isArray(activities.value) ? activities.value : Object.values(activities.value);


  const activityGroup = {
    name: store.name,
    activities: activitiesArray.map(activity => ({
      name: activity.name,
      weight: activity.weight
    }))
  };

  await activityGroupRef.value.save(activityGroup);

}
</script>

<style scoped>

</style>