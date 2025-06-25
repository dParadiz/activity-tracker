import {Connection} from "@/services/Connection";

import {v4} from 'uuid';

export class Channel {
    name: string;
    id: string;
    connections: Connection[];

    constructor(name: string) {
        this.connections = [];
        this.id = v4.toString();
        this.name = name;
    }

    addOrUpdateConnection(connection: Connection): void {
        const existingIndex = this.connections.findIndex(c => c.id === connection.id);
        if (existingIndex !== -1) {
            this.connections.splice(existingIndex, 1, connection);
        } else {
            this.connections.push(connection);
        }
    }
}