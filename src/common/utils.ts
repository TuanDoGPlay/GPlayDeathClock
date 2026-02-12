import type {Component} from "vue";
import DeathStory from "@/screens/share-clock/templates/DeathStory.vue";
import SaveADate from "@/screens/share-clock/templates/SaveADate.vue";

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
        image: '/templates/death-story/thumbnail.png',
        component: DeathStory
    }],
    [2, {
        id: 2,
        title: 'Save a Date',
        image: '/templates/save-a-date/thumbnail.png',
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
    },
    formatShortDuration(seconds: number): string {
        if (seconds <= 0) return '0s';

        const units = [
            {label: 'y', value: 31536000}, // 365 * 24 * 60 * 60
            {label: 'mo', value: 2592000}, // 30 * 24 * 60 * 60
            {label: 'w', value: 604800},   // 7 * 24 * 60 * 60
            {label: 'd', value: 86400},    // 24 * 60 * 60
            {label: 'h', value: 3600},
            {label: 'm', value: 60},
            {label: 's', value: 1},
        ];

        const result: string[] = [];
        let remainingSeconds = seconds;

        for (const {label, value} of units) {
            const amount = Math.floor(remainingSeconds / value);
            if (amount > 0) {
                result.push(`${amount}${label}`);
                remainingSeconds %= value;
            }

            // Dừng lại khi đã lấy đủ 2 đơn vị
            if (result.length === 2) break;
        }

        return result.join(' ');
    },
}