import {Activity} from "@/services/Activity";
import {Channel} from "@/services/Channel";

export class ActivityGroup {
    name: string;
    activities: Activity[] = [];
    channels: Channel[] = [];

    constructor(name: string, activities: Activity[]) {
        this.name = name;
        activities = activities || [];
        activities.forEach(activity => this.addActivity(activity));
        this.channels = [];
    }

    addActivity(activity: Activity): void {
        this.removeActivity(activity);
        this.activities.push(activity);
    }

    removeActivity(activity: Activity): void {
        this.activities = this.activities.filter(a => a.id !== activity.id);
    }

    addChannel(channel: Channel): void {
        this.channels.push(channel);
    }

    removeChannel(channel: Channel): void {
        this.channels = this.channels.filter(c => c.id !== channel.id);
    }

}