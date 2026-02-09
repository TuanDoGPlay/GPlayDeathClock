import type {QuestionTypeEnum} from "@/constants/questionType.ts";

export interface QuestionType {
    id: number
    question: string
    type: QuestionTypeEnum
    options?: string[]
}