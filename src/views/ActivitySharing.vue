<template>
  <div class="container py-5">
    <ActivityGroupList ref="activityGroupListRef" @activity-group-selected="selectGroup" :showDelete="false"/>

    <div class="mt-3">
      <input type="text" class="form-control mb-2" ref="offerInput" placeholder="Paste offer data here">
      <button @click="startFromOffer($refs.offerInput.value)" class="btn btn-primary">Accept connection offer</button>
    </div>

    <div v-if="selectedGroup.name" class="mt-4">
      <h3 class="h3 mb-4">Activity Group: {{ selectedGroup.name }}</h3>

      <div class="row">
        <div class="col-12 col-md-6 order-2 order-md-1">
          <div v-if="store.connections.length === 0" class="text-center">
            <p>No active connections</p>
          </div>
          <ul v-else class="list-group">
            <li v-for="connection in store.connections" :key="connection.id"
                class="list-group-item">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <span>{{ connection.remotePearName }}</span>
                <button
                    v-if="connection.status === ConnectionStatus.connected"
                    @click="sendActivityData(connection)"
                    class="btn btn-sm btn-primary mx-2">
                  Send Activities
                </button>
                <span class="badge"
                      :class="{'bg-success': connection.isConnected, 'bg-warning': !connection.isConnected}">
                  {{ connection.isConnected ? 'Connected' : connection.status }}
                </span>
              </div>
              <div v-if="connection.status !== ConnectionStatus.connected" class="connection-details">
                <div
                    v-if="connection.status === ConnectionStatus.accepted || connection.status === ConnectionStatus.answered"
                    class="text-center">
                  <button @click="generateAnswer(connection, $refs[`signalDataText_${connection.id}`][0])"
                          class="btn btn-primary mb-3">Generate Answer
                  </button>

                  <div class="d-flex align-items-center">
                    <span id="signalData" :ref="`signalDataText_${connection.id}`"
                          class="w-100 text-break text-truncate"></span>
                    <button class="btn btn-sm btn-secondary ms-2"
                            @click="copyToClipboard($refs[`signalDataText_${connection.id}`][0])">
                      Copy
                    </button>
                  </div>
                  <p class="mt-2">Return this answer data to compleat connection</p>
                </div>

                <div
                    v-if="connection.status === ConnectionStatus.new || connection.status === ConnectionStatus.connecting"
                    class="text-center">
                  <button @click="createOffer(connection, $refs[`signalDataText_${connection.id}`][0])"
                          class="btn btn-primary mb-3">Generate
                    Offer
                  </button>

                  <div class="d-flex align-items-center">
                    <span id="signalData" :ref="`signalDataText_${connection.id}`"
                          class="w-100 text-break text-truncate"></span>
                    <button class="btn btn-sm btn-secondary ms-2"
                            @click="copyToClipboard($refs[`signalDataText_${connection.id}`][0])">
                      Copy
                    </button>
                  </div>
                  <p class="mt-2">Share this data with pear to generate answer to establishing the connection</p>

                  <div v-if="connection.status === ConnectionStatus.connecting" class="mt-3">
                    <input type="text" class="form-control mb-2" :ref="`answerInput_${connection.id}`"
                           placeholder="Paste answer data here">
                    <button @click="acceptAnswer(connection, $refs[`answerInput_${connection.id}`][0].value)"
                            class="btn btn-success">
                      Accept Answer
                    </button>
                  </div>
                </div>
              </div>
            </li>
          </ul>
          <button @click="startNewConnection" class="btn btn-primary mt-3">Start New Connection</button>


        </div>

        <div class="col-12 col-md-6 order-1 order-md-2">
          <div class="card mb-3">
            <div class="card-header">Activity Group Details</div>
            <div class="card-body">
              <div v-if="selectedGroup.activities && selectedGroup.activities.length">
                <h5>Activities:</h5>
                <ul class="list-group">
                  <li v-for="(activity, index) in selectedGroup.activities" :key="index" class="list-group-item">
                    {{ activity.name }} (Weight: {{ activity.weight }})
                  </li>
                </ul>
              </div>
              <div v-else>
                <p>No activities in this group.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="alert alert-info mt-4">
        Please select an activity group to share.
      </div>
    </div>
  </div>
</template>

<script setup>

import {onMounted, onUnmounted, ref} from 'vue';
import {ActivityGroup} from '@/services/ActivityGroup';
import {Activity} from "@/services/Activity";
const activityGroupListRef = ref(null)
const copyToClipboard = async (element) => {
  if (element && element.innerHTML) {
    await navigator.clipboard.writeText(element.innerHTML);
  }
};
import {defineStore, storeToRefs} from 'pinia';
import ActivityGroupList from "@/components/ActivityGroupList.vue";

import {Connection} from '@/services/Connection';
import {ConnectionStatus} from '@/services/ConnectionStatus';


// State for the component
const selectedGroup = ref({name: '', activities: []});
const channel = ref(null);
const receivedData = ref(null);


const groupConnectionStore = defineStore('group-connections', {
  state: () => ({
    selectedGroup: new ActivityGroup(''),
    connections: [],
  }),
  actions: {
    async setSelectedGroup(group) {
      console.log('Setting selected group:', group);
      this.selectedGroup = group;
    },
    async updateConnection(connection) {
      connection.onMessageReceived = async (e) => {
        try {
          const message = JSON.parse(e.data);

          console.log('Received message:', message);

          if (message.type === 'groupSetupSync' && message.payload) {
            const activityGroup = new ActivityGroup(
                message.payload.name,
                message.payload.activities?.map(a => new Activity(a.name, a.weight)) || []
            );

            console.log('Received activity group:', activityGroup);
            selectedGroup.value = activityGroup;
            if (activityGroupListRef.value) {
              await activityGroupListRef.value.save(activityGroup);
            }
          }
        } catch (error) {
          console.error('Error processing received message:', error);
        }
      }
      this.connections = {...this.connections, [connection.id]: connection};
    }
  }
});

const store = groupConnectionStore();

// Handle group selection
const selectGroup = async (group) => {
  console.log('Selecting group:', group);
  selectedGroup.value = group;
  await store.setSelectedGroup(group);
};

const startNewConnection = async () => {
  const connection = new Connection('Initiator');
  connection.onStatusChange = (status) => {
    store.updateConnection(connection);
  };
  await store.updateConnection(connection);
}


// WebRTC connection setup
const createOffer = async (connection, signalDataElement) => {

  const offerSignal = await connection.createOfferSignal();
  await store.updateConnection(connection);

  setTimeout(() => {
    if (signalDataElement) {
      signalDataElement.innerHTML = btoa(JSON.stringify(
          {
            offerSignal: offerSignal.toString(),
            group: selectedGroup.value.name,
          }
      ));
    }
  }, 100);

};

const startFromOffer = async (offerData) => {
  if (!offerData) return;
  const offer = JSON.parse(atob(offerData));

  const connection = new Connection('Responder');
  connection.onStatusChange = (status) => {
    store.updateConnection(connection);
  };

  connection.setOffer(offer.offerSignal).then(async () => {
    const groupName = offer.group;
    await selectGroup({"name": groupName, "activities": []});

    await store.updateConnection(connection);
  });
}

const generateAnswer = async (connection, signalDataElement) => {

  console.log(connection);
  const answer = await connection.createAnswer();
  console.log(connection);
  await store.updateConnection(connection);

  setTimeout(() => {
    if (signalDataElement) {
      signalDataElement.innerHTML = answer.toString();
    }
  }, 100);
};


const acceptAnswer = async (connection, answerData) => {

  if (!answerData) {
    return;
  }

  try {
    await connection.acceptAnswer(answerData);
    await store.updateConnection(connection);
  } catch (error) {
    console.error('Error accepting answer:', error);
  }
};

// Send activity data through the data channel
const sendActivityData = (connection) => {

  const data = JSON.stringify({
    type: 'groupSetupSync',
    payload: selectedGroup.value
  });

  connection.sendData(data).then(() => {
    console.log('Sent activity data:', data);
  }).catch((error) => {
    console.error('Failed to send activity data:', error);
  });

};

// Apply received activity data
const applyReceivedData = async () => {
  if (receivedData.value) {
    try {

      console.log('Received activity data:', receivedData.value);
    } catch (error) {
      console.error('Error applying received data:', error);
      alert('Failed to save activity group: ' + error.message);
    }
  }
};


onUnmounted(() => {
  // TODO
});

// Initialize on component mount
onMounted(async () => {

});
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

#qrcode, #answerQrcode {
  display: inline-block;
  margin: 15px 0;
}

.text-truncate {
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>