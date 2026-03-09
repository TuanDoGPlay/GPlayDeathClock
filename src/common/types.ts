import { Utils } from "@/common/utils.ts";
import { QuestionMethodEnum } from "@/constants/questionMethod.ts";

export interface QuestionData {
  id: number;
  question: string;
  type: string;
  options?: string[];
  method: number;
  logic: Record<string, any>;
  time?: number;
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
    this.displayTime = Utils.formatShortDuration(data.time);
  }
}

export class QuestionInstance implements QuestionData {
  id: number;
  question: string;
  type: string;
  options?: string[];
  method: QuestionMethodEnum;
  logic: Record<string, any>;
  time?: number;

  constructor(data: QuestionData) {
    this.id = data.id;
    this.question = data.question;
    this.type = data.type;
    this.options = data.options;
    this.method = data.method;
    this.logic = data.logic;
  }
}

export interface TextRandomAnswerLogic {
  from: string;
  to: string;
}

export interface SelectRandomAnswerLogic {
  random: TextRandomAnswerLogic[];
}

export interface BucketItemData {
  id: string;
  label: string;
  completed: boolean;
}
