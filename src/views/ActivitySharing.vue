<template>
  <div class="container py-5">
    <div class="mb-3">
      <input type="text" class="form-control" v-model="peerName" placeholder="Enter your name">
    </div>

    <ActivityGroupList ref="activityGroupListRef" @activity-group-selected="selectGroup" :showDelete="false"/>

    <ChannelComponent ref="channelRef" :peerName="peerName"/>

    <div v-if="selectedGroup" class="mt-4">
      <h4>Active Connections</h4>
      <ul class="list-group">
        <li v-for="channel in groupChannels" :key="channel.id" class="list-group-item">
          {{ channel.name  }}
        </li>
      </ul>
    </div>


  </div>
</template>

<script setup lang="ts">

import {onMounted, onUnmounted, ref, computed} from 'vue';
import ChannelComponent from "@/components/ChannelComponent.vue";
import ActivityGroupList from "@/components/ActivityGroupList.vue";

import {Channel} from "@/services/Channel";

const activityGroupListRef = ref(null);
const peerName = ref('');
const channelRef = ref(null);

const selectedGroup = ref(null);

const groupChannels = computed(() => {
  return selectedGroup.value?.channels || [];
});


const selectGroup = async (group: ActivityGroup) => {
  selectedGroup.value = group;  
  const channel = new Channel('some channel');

  group.addChannel(channel);

  await channelRef.value.setChannel(channel, group)

};

onUnmounted(() => {

});

// Initialize on component mount
onMounted(async () => {

});
</script>

<style scoped>

</style>