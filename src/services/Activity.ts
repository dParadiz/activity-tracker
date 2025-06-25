import {v4} from 'uuid';

export class Activity {
    id: string;

    constructor(
        public readonly name: string,
        public readonly weight: bigint
    ) {
        this.id = v4().toString();
    }

}