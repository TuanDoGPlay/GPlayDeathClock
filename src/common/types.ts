import {Utils} from "@/common/utils.ts";
import {QuestionMethodEnum} from "@/constants/questionMethod.ts";

export interface QuestionData {
    id: number
    question: string
    field: string
    type: string
    options?: string[]
    method?: number
    value?: Record<string, any>
}


export interface UserData {
    name: string
    dob: string
    sex: string
    height: number
    weight: number
    sexualOrientation: string
    remainTime: number
}

export interface MissionData {
    id: number
    label: string
    time: number
}

export class MissionInstance implements MissionData {
    id: number
    label: string
    time: number
    displayTime: string
    completed: boolean = false

    constructor(data: MissionData) {
        this.id = data.id
        this.label = data.label
        this.time = data.time
        this.displayTime = Utils.formatShortDuration(data.time)
    }
}

export class QuestionInstance implements QuestionData {
    id: number
    question: string
    field: string
    type: string
    options?: string[]
    method?: QuestionMethodEnum
    value?: Record<string, any>

    constructor(data: QuestionData) {
        this.id = data.id
        this.question = data.question
        this.field = data.field
        this.type = data.type
        this.options = data.options
        this.method = data.method
        this.value = data.value
    }

    calculateTime(): number {
        if (this.method == QuestionMethodEnum.RandomRange) {
            const value = this.value as RandomRangeAnswer;
            return Math.random() * (value.max - value.min) + value.min;
        }
        if (this.method == QuestionMethodEnum.SelectionRandomRange) {
            const value = this.value as RandomRangeAnswer;
            return Math.random() * (value.max - value.min) + value.min;
        }
        return 0
    }
}

interface RandomRangeAnswer {
    min: number
    max: number
}

interface SelectionRandomRangeAnswer {
    min: number
    max: number
}

export interface BucketItemData {
    id: string
    label: string
    completed: boolean
}