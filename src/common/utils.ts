import type {Component} from "vue";
import DeathStory from "@/screens/home/share-clock/templates/DeathStory.vue";
import SaveADate from "@/screens/home/share-clock/templates/SaveADate.vue";

export interface ShareTemplate {
    id: number,
    title: string,
    image: string,
    component: Component
}

const shareTemplateMapping = new Map<number, ShareTemplate>([
    [1, {
        id: 1,
        title: 'Death Story',
        image: '/death-story.png',
        component: DeathStory
    }],
    [2, {
        id: 2,
        title: 'Save a Date',
        image: '/save-a-date.png',
        component: SaveADate
    }]

])

export const Utils = {
    getAllShareTemplates: (): ShareTemplate[] => {
        return Array.from(shareTemplateMapping.values())
    },
    getShareTemplateComponentById: (id: number): Component | undefined => {
        return shareTemplateMapping.get(id)?.component
    },
    formatFullDuration: (totalSeconds: number) => {
        if (totalSeconds === 0) return "0 seconds";

        // Định nghĩa hằng số giây cho từng đơn vị (Dựa trên năm 365 ngày, tháng 30 ngày)
        const units = [
            {label: 'year', seconds: 31536000},
            {label: 'month', seconds: 2592000}, // 30 ngày
            {label: 'week', seconds: 604800},
            {label: 'day', seconds: 86400},
            {label: 'hour', seconds: 3600},
            {label: 'minute', seconds: 60},
            {label: 'second', seconds: 1}
        ];

        let remaining = totalSeconds;
        const parts: string[] = [];

        units.forEach(unit => {
            const value = Math.floor(remaining / unit.seconds);
            if (value > 0) {
                parts.push(`${value} ${unit.label}${value > 1 ? 's' : ''}`);
                remaining %= unit.seconds;
            }
        });

        return parts.join(', ');
    }

}