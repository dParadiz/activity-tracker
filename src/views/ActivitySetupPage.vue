<template>
  <div class="container py-5">
    <ActivityGroup ref="activityGroupRef" @activity-group-selected="selectGroup" class="mb-3"/>

    <form @submit.prevent="addActivity" class="mb-3">
      <div class="row g-4">
        <div class="col-12">
          <div class="d-flex align-items-center">
            <label for="groupName" class="me-2">Name:</label>
            <input
                id="groupName"
                v-model="store.name"
                type="text"
                required
                class="form-control"
            />
          </div>
        </div>

        <div class="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4 mb-5 mt-4">


          <div v-for="activity in activities" :key="activity.id" class="col">
            <div class="card mb-3 cursor-pointer border-success" style="max-width: 20rem;"
                 :class="{'border-danger':activity.weight < 0}"
            >
              <div class="card-header">{{ activity.name }}</div>
              <div class="card-body">
                <p class="card-text">Weight: {{ activity.weight }}</p>
                <button @click="removeActivity(activity.id)"
                        class="btn btn-warning">Remove
                </button>
              </div>

            </div>
          </div>

        </div>

        <div class="col-12">
          <div class="row g-3">
            <div class="col-md-4">
              <label for="activityName" class="form-label">Activity Name:</label>
              <input
                  id="activityName"
                  v-model="newActivity.name"
                  type="text"
                  required
                  class="form-control"
              />
            </div>
            <div class="col-md-4">
              <label for="activityWeight" class="form-label">Weight:</label>

              <input
                  id="activityWeight"
                  v-model.number="newActivity.weight"
                  type="number"
                  step="1"
                  required
                  class="form-control"
              />
            </div>
            <div class="col-md-4 d-flex align-items-end">
              <button type="submit" class="btn btn-primary">Add Activity</button>
            </div>
          </div>
        </div>

        <div class="col-12">
          <button type="button" @click="saveActivities" :disabled="!store.name"
                  class="btn btn-primary mt-3">
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