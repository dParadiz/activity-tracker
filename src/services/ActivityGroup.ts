import {Activity} from "@/services/Activity.ts";

export class ActivityGroup {
    name: string;
    activities: Activity[] = [];


    constructor(name: string, activities: Activity[]) {
        this.name = name;

        activities = activities || [];
        activities.forEach(activity => this.addActivity(activity));
    }

    addActivity(activity: Activity): void {
        this.removeActivity(activity);
        this.activities.push(activity);
    }

    removeActivity(activity: Activity): void {
        this.activities = this.activities.filter(a => a.id !== activity.id);
    }

}