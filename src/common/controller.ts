import { Database } from "gplay-app-sdk";
import questions from "@/assets/data/questions.json";
import {
  type BucketItemData,
  type MissionData,
  MissionInstance,
  type QuestionData,
  QuestionInstance,
  type UserData,
} from "@/common/types.ts";
import { v4 as uuidv4 } from "uuid";
import dailyMissions from "@/assets/data/daily-missions.json";
import { Utils } from "./utils";
import { Preferences } from "@capacitor/preferences";
import { EventEnum } from "@/constants/events";

const userKey = "user";
const remainLiveKey = "remain";

const bucketTable = "buckets";
const missionTable = "missions";
const questionTable = "questions";

export const CommonController = {
  async init() {
    const startDate = new Date("2000-01-01T00:00:00");
    const futureDate = new Date(startDate);
    futureDate.setFullYear(startDate.getFullYear() + 85);
    const db = {
      [bucketTable]: [],
      [missionTable]: [],
      [questionTable]: [],
    };
    await Database.initDatabase(db);
  },

  async refreshDailyMission(): Promise<void> {
    return await Database.deleteTable(missionTable, {});
  },

  async getQuestions(): Promise<QuestionInstance[]> {
    const answeredQuestions =
      await Database.selectTable<QuestionData>(questionTable);
    const notAnsweredQuestions: QuestionData[] = [];
    questions.forEach((q) => {
      if (!answeredQuestions.find((i) => i.id == q.id))
        notAnsweredQuestions.push(q);
    });
    return notAnsweredQuestions
      .slice(0, 10)
      .map((q: QuestionData) => new QuestionInstance(q));
  },

  async answerQuestion(question: QuestionInstance, answer: any): Promise<void> {
    console.log("answer", answer);

    if (answer) {
      const incrementTime = Utils.calculateQuestionIncrementTime(
        question,
        answer,
      );
      question.time = incrementTime;
      await CommonController.editRemainLiveTime(incrementTime);
    }
    const exist = await Database.selectTable<QuestionInstance>(questionTable, {
      id: question.id,
    });
    console.log(exist.length);

    if (exist.length) {
      await CommonController.editRemainLiveTime(-(exist[0]?.time ?? 0));
      await Database.updateTable(questionTable, { id: question.id }, question);
      return Promise.resolve();
    }
    await Database.insertTable(questionTable, question);
    return Promise.resolve();
  },

  async getDailyMission(): Promise<MissionInstance[]> {
    try {
      const raw = (await Database.selectTable<MissionData>(missionTable)) ?? [];
      const missions = dailyMissions.map((m) => new MissionInstance(m));
      missions.forEach((m) => {
        m.completed = raw.some((r) => r.id === m.id);
      });

      const completedMissions = missions.filter((m) => m.completed);
      const uncompletedMissions = missions.filter((m) => !m.completed);

      return Promise.resolve([...uncompletedMissions, ...completedMissions]);
    } catch (e) {
      return Promise.reject(e);
    }
  },

  async editMission(mission: MissionInstance) {
    try {
      if (mission.completed) {
        await Database.insertTable(missionTable, mission);
        await this.editRemainLiveTime(mission.time);
      } else {
        await Database.deleteTable(missionTable, { id: mission.id });
        await this.editRemainLiveTime(-mission.time);
      }
      document.dispatchEvent(new Event(EventEnum.ChangeTime));
    } catch (e) {
      return Promise.reject(e);
    }
  },

  async getUserData(): Promise<UserData> {
    const { value } = await Preferences.get({ key: userKey });
    if (!value) {
      const newData = {
        name: "",
        dob: "",
        sex: "",
        height: 0,
        weight: 0,
        sexualOrientation: "",
      };
      await Preferences.set({ key: userKey, value: JSON.stringify(newData) });
      return Promise.resolve(newData);
    }
    return Promise.resolve(JSON.parse(value));
  },

  async saveUserData(data: UserData): Promise<void> {
    await Preferences.set({ key: userKey, value: JSON.stringify(data) });
    return Promise.resolve();
  },

  async getRemainLiveTime(): Promise<number> {
    const { value } = await Preferences.get({ key: remainLiveKey });
    if (!value) {
      return Promise.resolve(0);
    }
    return Promise.resolve(JSON.parse(value));
  },

  async editRemainLiveTime(
    time: number,
    isIncrement: boolean = true,
  ): Promise<void> {
    const oldRemainLive = await this.getRemainLiveTime();
    const newTime = isIncrement ? oldRemainLive + time : time;
    console.log("live", time, newTime, new Date(newTime));
    await Preferences.set({
      key: remainLiveKey,
      value: JSON.stringify(newTime),
    });
    document.dispatchEvent(new Event(EventEnum.ChangeTime));
    return Promise.resolve();
  },

  async getBucketList() {
    const res = (await Database.selectTable(bucketTable)) ?? [];
    return res as BucketItemData[];
  },

  async createBucketItem(name: string): Promise<void> {
    const item: BucketItemData = {
      id: uuidv4(),
      label: name,
      completed: false,
    };
    await Database.insertTable(bucketTable, item);
    return Promise.resolve();
  },

  async editBucketItem(item: BucketItemData): Promise<void> {
    await Database.updateTable(bucketTable, { id: item.id }, item);
    return Promise.resolve();
  },

  async getIsFirstVisit(): Promise<boolean> {
    const userData = await this.getUserData();
    if (
      userData.name &&
      userData.dob &&
      userData.sex &&
      userData.height &&
      userData.weight &&
      userData.sexualOrientation
    ) {
      return Promise.resolve(false);
    }
    return Promise.resolve(true);
  },
};
