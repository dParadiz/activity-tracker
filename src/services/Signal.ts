export class Signal {


    constructor(

        public readonly session: RTCSessionDescriptionInit,
        public readonly iceCandidates: RTCIceCandidate[],
        public readonly type: string,
        public readonly peerName: string
    ) {

    }

    toString(): string {
        return btoa(JSON.stringify(this));
    }

    static fromString(content: string): Signal {

        const data = JSON.parse(atob(content));

        return new Signal( data.session, data.iceCandidates, data.type, data.peerName);
    }
}