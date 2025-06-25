import {Connection} from "@/services/Connection.ts";

export class Channel {
    activityGroup: any;
    connection: { [key: string]: Connection };

    constructor(activityGroup: any) {
        this.activityGroup = activityGroup;
        this.connection = {}
    }

    addConnection(connection: Connection): void {
        this.connection[connection.id] = connection;
    }
}