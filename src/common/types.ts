import {Utils} from "@/common/utils.ts";
import {QuestionMethodEnum} from "@/constants/questionMethod.ts";

export interface ReverseClockView {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
}

export interface UserData {
    name: string;
    dob: string;
    sex: string;
    height: number;
    weight: number;
    sexualOrientation: string;
}

export interface MissionData {
    id: number;
    label: string;
    time: number;
    complete?: boolean;
}

export class MissionInstance implements MissionData {
    id: number;
    label: string;
    time: number;
    displayTime: string;
    completed: boolean = false;

    constructor(data: MissionData) {
        this.id = data.id;
        this.label = data.label;
        this.time = data.time;
        if (data.complete) this.completed = data.complete;
        this.displayTime = Utils.formatShortDuration(data.time);
    }
}

export interface QuestionData {
    id: number;
    question: string;
    type: string;
    options?: string[];
    method: number;
    logic: Record<string, any>;
    time: number;
    label: string;
    min?: number;
    max?: number;
}

export class QuestionInstance implements QuestionData {
    id: number;
    question: string;
    type: string;
    options?: string[];
    method: QuestionMethodEnum;
    logic: Record<string, any>;
    time: number;
    label: string;
    min?: number;
    max?: number;

    constructor(data: QuestionData) {
        this.id = data.id;
        this.question = data.question;
        this.type = data.type;
        this.options = data.options;
        this.method = data.method;
        this.logic = data.logic;
        this.time = data.time;
        this.label = data.label;
        this.min = data.min;
        this.max = data.max;
    }
}

export interface TextRandomAnswerLogic {
    from: string;
    to: string;
}

export interface SelectRandomAnswerLogic {
    random: TextRandomAnswerLogic[];
}

export interface SliderOffsetAnswerLogic {
    ideal: [number, number];       // Ví dụ: [8, 10]
    bonus: {                       // Khoảng thưởng khi nằm trong mốc lý tưởng
        from: string;
        to: string;
    };
    penaltyPerHour: string;      // Giá trị phạt cho mỗi giờ lệch (Ví dụ: "-1y")
}

// Interface cho Method 4: ValueMatch (Dùng cho câu hỏi về số bữa ăn)
export interface ValueMatchAnswerLogic {
    rules: {
        values: number[];            // Các giá trị áp dụng (Ví dụ: [1, 4, 5])
        from: string;                // Khoảng biến thiên dưới
        to: string;                  // Khoảng biến thiên trên
    }[];
}

export interface BucketItemData {
    id: string;
    label: string;
    completed: boolean;
}
