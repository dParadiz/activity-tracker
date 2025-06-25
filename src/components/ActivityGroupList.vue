<template>
  <div class="">
    <h2 class="h2 mb-4">Activity groups</h2>
    <ul class="list-group">
      <li v-for="group in activityGroups" :key="group.name"
          @click="$emit('activity-group-selected', group)"
          :class="{'active': selectedGroup.name === group.name}"
          class="list-group-item list-group-item-action cursor-pointer d-flex justify-content-between align-items-center"
          @click.stop="selectGroup(group)"
      >
        {{ group.name }}
        <button v-if="showDelete"
                @click.stop="deleteGroup(group.name)"
                class="btn btn-warning btn-sm">
          Remove
        </button>
      </li>
    </ul>
  </div>
</template>
<script setup>

import {
  deleteActivityGroup,
  loadActivityGroups,
  removeTrackingHistory,
  saveActivityGroup
} from '@/services/dbService'

import {onMounted} from 'vue'
import {defineStore, storeToRefs} from 'pinia'

defineProps({
  showDelete: {
    type: Boolean,
    default: true
  }
})

const useGroupStore = defineStore('groups', {
  state: () => ({
    activityGroups: [],
    selectedGroup: {
      name: ''
    }
  }),
  actions: {
    async loadGroups() {
      this.activityGroups = await loadActivityGroups();

    },
    async setSelectedGroup(group) {
      this.selectedGroup = group
    },
    async deleteGroup(name) {
      await deleteActivityGroup(name);
      await removeTrackingHistory(name);
      this.activityGroups = this.activityGroups.filter(g => g.name !== name)
    },
    async saveGroup(group) {
      await saveActivityGroup(group)
      const existingGroupIndex = this.activityGroups.findIndex(g => g.name === group.name)
      if (existingGroupIndex !== -1) {
        this.activityGroups[existingGroupIndex] = group
      } else {
        this.activityGroups.push(group)
      }
    }
  }
})


const store = useGroupStore()
const {activityGroups, selectedGroup} = storeToRefs(store)
onMounted(async () => {
  await store.loadGroups();
})

const deleteGroup = async (name) => {
  await store.deleteGroup(name);
}
const selectGroup = async (group) => {
  await store.setSelectedGroup(group);
}
const save = async (activityGroup) => {
  await store.saveGroup(activityGroup);
}

defineExpose({
  save
})

</script>
<style scoped>

</style>