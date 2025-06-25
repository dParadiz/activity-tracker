<template>
  <div class="container mt-4">
    <div class="row">
      <!-- Left Column - Activity Group -->
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title">{{ store.activityGroup?.name || 'No Group Selected' }}</h5>
          </div>
          <div class="card-body">
            <ul class="list-group" v-if="store.activityGroup?.activities">
              <li class="list-group-item" v-for="activity in store.activityGroup.activities" :key="activity.id">
                {{ activity.name }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="col-md-6">

        <div class="card" v-if="props.peerName">
          <div class="card-header">
            <h5 class="card-title">Connections</h5>
          </div>
          <div class="card-body">
            <ul class="list-group mb-3">
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
                        :class="{'bg-success': connection.status === ConnectionStatus.connected, 'bg-warning': connection.status !== ConnectionStatus.connected}">
                  {{ connection.status }}
                </span>
                </div>
                <div v-if="connection.status !== ConnectionStatus.connected" class="connection-details">
                  <div
                      v-if="connection.status === ConnectionStatus.accepted || connection.status === ConnectionStatus.answered"
                      class="text-center">

                    <div class="d-flex align-items-center">
                      <span :ref="`answerSignal_${connection.id}`"
                            class="w-100 text-break text-truncate"
                            v-once
                            @vue:mounted="generateAnswer(connection, $refs[`answerSignal_${connection.id}`][0])"
                      ></span>
                      <button class="btn btn-sm btn-secondary ms-2"
                              @click="copyToClipboard($refs[`answerSignal_${connection.id}`][0])">
                        Copy
                      </button>
                    </div>
                    <p class="mt-2">Return this answer data to complete connection</p>
                  </div>

                  <div
                      v-if="(connection.status === ConnectionStatus.new || connection.status === ConnectionStatus.connecting) "
                      class="text-center">
                    <div class="d-flex align-items-center">
                      
                    <span id="signalData" :ref="`offerSignal_${connection.id}`"
                          class="w-100 text-break text-truncate"
                          v-once
                          @vue:mounted="createOffer(connection, $refs[`offerSignal_${connection.id}`][0])"></span>
                      <button class="btn btn-sm btn-secondary ms-2"
                              @click="copyToClipboard($refs[`offerSignal_${connection.id}`][0])">
                        Copy
                      </button>
                    </div>
                    <p class="mt-2">Share this data with pear to generate answer to establishing the connection</p>

                    <div v-if="connection.status === ConnectionStatus.connecting" class="mt-3">
                      <input type="text" class="form-control mb-2" :ref="`answerInput_${connection.id}`"
                             placeholder="Paste answer data here"
                             @change="acceptAnswer(connection, $refs[`answerInput_${connection.id}`][0].value)">
                    </div>
                  </div>
                </div>
              </li>
            </ul>

            <button v-if="store.activityGroup" class="btn btn-primary mb-3" @click="startNewConnection">
              Start New Connection
            </button>

            <div class="input-group">
              <input type="text" class="form-control" v-model="connectionOffer" placeholder="Enter connection offer">
              <button class="btn btn-success" @click="acceptConnectionOffer(connectionOffer)">
                Accept Offer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import {ref} from 'vue';
import {defineStore} from 'pinia';
import {Channel} from "@/services/Channel";
import {ActivityGroup} from "@/services/ActivityGroup";
import {Connection} from "@/services/Connection";
import {ConnectionStatus} from "@/services/ConnectionStatus.ts";

const props = defineProps<{
  peerName: string
}>()


const connectionOffer = ref('');
const currentChannel = ref<Channel | null>(null);

const channelStore = defineStore('channel', {
  state: () => ({
    activityGroup: null as ActivityGroup | null,
    connections: {} as Record<string, Connection>,
  }),
  actions: {
    async saveConnection(connection: Connection) {
      connection.onMessageReceived = async (e) => {
        try {
          const message = JSON.parse(e.data);

          console.log('Received message:', message);

        } catch (error) {
          console.error('Error processing received message:', error);
        }
      }
      this.connections = {...this.connections, [connection.id]: connection};

      currentChannel.value?.addOrUpdateConnection(connection);
    },
  }
})

const store = channelStore();

const setChannel = async (channel: Channel, activityGroup: ActivityGroup )  => {
  store.activityGroup = activityGroup;
  store.connections = {};
  for (const connection of channel.connections) {
    await store.saveConnection(connection);
  }
  currentChannel.value = channel;
}

defineExpose({
  setChannel
})

async function startNewConnection() {
  console.log('Starting new connection as ' + props.peerName);
  const connection = new Connection(props.peerName);
  // update
  connection.onStatusChange = async () => {
    await store.saveConnection(connection);
  };

  await store.saveConnection(connection);
}

const createOffer = async (connection: Connection, signalOutputElement: HTMLElement) => {
  const offerSignal = await connection.createOfferSignal();
  await store.saveConnection(connection);

  setTimeout(() => {
    if (signalOutputElement) {
      signalOutputElement.innerHTML = btoa(JSON.stringify(
          {
            offerSignal: offerSignal.toString(),
            group: store.activityGroup,
          }
      ));
    }
  }, 100);
};

const generateAnswer = async (connection: Connection, signalDataElement: HTMLElement) => {
  const answer = await connection.createAnswer();
  await store.saveConnection(connection);


  setTimeout(() => {
    if (signalDataElement) {
      signalDataElement.innerHTML = answer.toString();
    }
  }, 100);
};

const copyToClipboard = async (element: HTMLElement) => {
  if (element && element.innerHTML) {
    await navigator.clipboard.writeText(element.innerHTML);
  }
};

const acceptAnswer = async (connection: Connection, answerData: string) => {

  if (!answerData) {
    return;
  }

  try {
    await connection.acceptAnswer(answerData);
    await store.saveConnection(connection);
  } catch (error) {
    console.error('Error accepting answer:', error);
  }
};

const sendActivityData = (connection: Connection) => {

  const data = JSON.stringify({
    type: 'groupSetupSync',
    payload: store.activityGroup
  });

  connection.sendData(data).then(() => {
    console.log('Sent activity data:', data);
  }).catch((error) => {
    console.error('Failed to send activity data:', error);
  });

};

async function acceptConnectionOffer(offerData: string) {
  if (!offerData) return;

  const offer = JSON.parse(atob(offerData));

  const connection = new Connection(props.peerName);
  connection.onStatusChange = () => {
    store.saveConnection(connection);
  };

  connection.setOffer(offer.offerSignal).then(async () => {

    store.activityGroup = offer.group;

    await store.saveConnection(connection);
  });

}

</script>
<style scoped>
.text-truncate {
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>