import {ConnectionStatus} from "@/services/ConnectionStatus.ts";
import {v4} from 'uuid';
import {Signal} from "@/services/Signal.ts";


const webRTCConfig: RTCConfiguration = {
    iceServers: [{urls: "stun:stun.l.google.com:19302"}],
};


export class Connection {
    peerConnection: RTCPeerConnection;
    dataChannel: RTCDataChannel | null;
    id: string;
    status: ConnectionStatus;
    peerName: string;
    remotePearName: string | null = null;
    iceCandidates: RTCIceCandidate[];
    onStatusChange: (status: ConnectionStatus) => void;
    onMessageReceived: (message: MessageEvent) => void;


    constructor(peerName: string) {
        this.id = v4().toString();
        this.dataChannel = null;
        this.status = ConnectionStatus.new;
        this.peerName = peerName;
        this.iceCandidates = [];

        this.peerConnection = new RTCPeerConnection(webRTCConfig);

        this.peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
            if (event.candidate) {
                this.iceCandidates.push(event.candidate);
            }
        };

        this.peerConnection.onconnectionstatechange = (e: Event) => {

            console.log(e.currentTarget );
            if (e.currentTarget instanceof RTCPeerConnection && e.currentTarget.connectionState === 'connected') {
                this.setStatus(ConnectionStatus.connected);
            }

            if (e.currentTarget instanceof RTCPeerConnection && e.currentTarget.connectionState === 'disconnected') {
               this.setStatus(ConnectionStatus.closed)
            }

        }
        this.onStatusChange = () => {};
        this.onMessageReceived = () => {};
    }

    openDataChannel(): void {
        this.dataChannel = this.peerConnection.createDataChannel('dataChannel');

        if (this.dataChannel) {
            console.log(this.id + ' Data channel created');
            this.dataChannel.onopen = (_: Event) => {
               this.setStatus(ConnectionStatus.connected);
                console.log(this.id + ' Data channel state is: ' + this.dataChannel?.readyState);
            }
            this.dataChannel.onclose = (_: Event) => console.log(this.id + ' Data channel state is: ' + this.dataChannel?.readyState);
            this.dataChannel.onerror = (e: Event) => console.log(this.id + ' Error ', e);
            this.dataChannel.onmessage = (e: MessageEvent) => this.onMessageReceived(e);
        } else {
            console.log(this.id + ' Error creating data channel');
        }
    }

    setDataChannelCallback(): void {
        this.peerConnection.ondatachannel = (event: RTCDataChannelEvent) => {
            console.log('Receive Channel Callback', event);
            this.dataChannel = event.channel;
            this.dataChannel.onmessage = (e: MessageEvent) => this.onMessageReceived(e);
            this.dataChannel.onopen = (_: Event) => {
                if (!this.dataChannel) return;
                const readyState = this.dataChannel.readyState;
                console.log(this.id + ': Data channel state is: ' + readyState);

                if (readyState == "open") {
                    this.setStatus(ConnectionStatus.connected);
                }
            };

            this.dataChannel.onclose = (_: Event) => {
                if (!this.dataChannel) return;
                const readyState = this.dataChannel.readyState;
                console.log(this.id + ': Data channel state is: ' + readyState);
            };
        }
    }

    createOfferSignal = async (): Promise<Signal> => {
        try {
            this.openDataChannel();

            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);

            await this.waitForIceCandidates();

            this.setStatus(ConnectionStatus.connecting);

            return new Signal(
                offer,
                this.iceCandidates,
                'offer',
                this.peerName,
            );

        } catch (error) {
            console.error('Error creating offer:', error);
            return Promise.reject(error);
        }
    };

    private async waitForIceCandidates() {
        await new Promise<void>((resolve) => {
            const checkIceCandidates = () => {
                if (this.iceCandidates.length > 0) {

                    resolve();
                } else {
                    console.log(this.id + ': Waiting for ICE candidates');
                    setTimeout(checkIceCandidates, 100);
                }
            };
            checkIceCandidates();
        });
    }

    setOffer = async (offerSignalString: string): Promise<void> => {
        try {
            if (!offerSignalString) return;
            const offerSignal = Signal.fromString(offerSignalString);

            if (offerSignal.type !== 'offer') {
                return Promise.reject(this.id + ': setOffer called with invalid signal type');
            }

            this.setDataChannelCallback();

            console.log(offerSignal);

            await this.peerConnection.setRemoteDescription(offerSignal.session);

            offerSignal.iceCandidates.forEach((candidate) => {
                console.log(this.id + ': adding ice candidates');
                this.peerConnection.addIceCandidate(candidate)
            });

            this.remotePearName = offerSignal.peerName;
            this.setStatus(ConnectionStatus.accepted);

        } catch (error) {
            return Promise.reject(error);
        }
    }
    createAnswer = async (): Promise<Signal> => {
        if (this.status !== ConnectionStatus.accepted) {
            return Promise.reject(this.id + ': createAnswer called before offer was accepted');
        }

        try {

            return await this.peerConnection.createAnswer().then(async (answer: RTCSessionDescriptionInit) => {
                await this.peerConnection.setLocalDescription(answer);

                this.setStatus(ConnectionStatus.answered);

                this.setDataChannelCallback();
                await this.waitForIceCandidates();
                return new Signal(
                    answer,
                    this.iceCandidates,
                    'answer',
                    this.peerName
                )
            });


        } catch (error) {
            return Promise.reject(error);
        }
    };

    acceptAnswer = async (answerSignal: string): Promise<void> => {

        if (!answerSignal || this.status !== ConnectionStatus.connecting) {
            return Promise.reject(this.id + ': ' + (
                !answerSignal
                    ? 'acceptAnswer called with no answer'
                    : 'acceptAnswer called before offer was accepted'));
        }

        const signal = Signal.fromString(answerSignal);

        if (signal.type !== 'answer') {
            return Promise.reject(this.id + ':acceptAnswer called with invalid signal type');
        }

        try {
            await this.peerConnection?.setRemoteDescription(signal.session);

            signal.iceCandidates.forEach((candidate) => {
                console.log(this.id + ': adding ice candidates');
                this.peerConnection.addIceCandidate(candidate);
            });

            this.remotePearName = signal.peerName;
            this.setStatus(ConnectionStatus.connected);

        } catch (error) {
            return Promise.reject(error);

        }
    }

    sendData = async (data: string): Promise<void> => {
        if (!this.dataChannel) return;
        try {
            this.dataChannel.send(data);
        } catch (error) {
            return Promise.reject(error);
        }
    }
    setStatus = (status: ConnectionStatus): void => {
        console.log(this.id + ': Setting status to ' + status);
        this.status = status;
        this.onStatusChange(status);
    }


}