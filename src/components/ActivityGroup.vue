<template>
  <div class="bg-white shadow-md">
    <ul class="list-none p-0">
      <li v-for="group in activityGroups" :key="group.name"
          @click="$emit('activity-group-selected', group)"
          :class="{'bg-gray-200': selectedGroup.name === group.name}"
          class="p-2.5 cursor-pointer flex justify-between items-center border-b border-gray-200 hover:bg-gray-100"
          @click.stop="selectGroup(group)"
      >
        {{ group.name }}
        <button v-if="showDelete"
                @click.stop="deleteGroup(group.name)"
                class="px-2 py-1 text-xs text-white bg-red-500 rounded hover:bg-red-600">
          Remove
        </button>
      </li>
    </ul>
  </div>
</template>
<script setup>
import {deleteActivityGroup, loadActivityGroups, saveActivityGroup} from '@/services/dbService.js'
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
      this.activityGroups = await loadActivityGroups()
    },
    async setSelectedGroup(group) {
      this.selectedGroup = group
    },
    async deleteGroup(name) {
      await deleteActivityGroup(name)
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
  await store.loadGroups()
})

const deleteGroup = async (name) => {
  await store.deleteGroup(name)
}
const selectGroup = async (group) => {
  await store.setSelectedGroup(group)
}
const save = async (activityGroup) => {
  await store.saveGroup(activityGroup)
}

defineExpose({
  save
})

</script>
<style scoped>

</style>