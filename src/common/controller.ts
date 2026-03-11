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

const USER = "user";
const REMAINLIVE = "remain";
const LASTVISIT = "last_visited_date";

const BUCKET = "buckets";
const MISSION = "missions";
const QUESTION = "questions";

export const CommonController = {
  async init() {
    const db = {
      [BUCKET]: [],
      [MISSION]: [],
      [QUESTION]: [],
    };
    await Database.initDatabase(db);
  },
  async checkAndRunNewDayTask() {
    const today = new Date().toISOString().split("T")[0];
    const lastDate = localStorage.getItem(LASTVISIT);

    if (today && lastDate !== today) {
      await this.refreshDailyMission();
      Preferences.set({
        key: LASTVISIT,
        value: today,
      });
      return true;
    }

    return false;
  },

  async refreshDailyMission(): Promise<void> {
    return await Database.deleteTable(MISSION, {});
  },

  async getQuestions(): Promise<QuestionInstance[]> {
    const answeredQuestions =
      await Database.selectTable<QuestionData>(QUESTION);
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
    const exist = await Database.selectTable<QuestionInstance>(QUESTION, {
      id: question.id,
    });
    console.log(exist.length);

    if (exist.length) {
      await CommonController.editRemainLiveTime(-(exist[0]?.time ?? 0));
      await Database.updateTable(QUESTION, { id: question.id }, question);
      return Promise.resolve();
    }
    await Database.insertTable(QUESTION, question);
    return Promise.resolve();
  },

  async getDailyMission(): Promise<MissionInstance[]> {
    try {
      const raw = (await Database.selectTable<MissionData>(MISSION)) ?? [];
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

  async getCompletedMission(): Promise<MissionInstance[]> {
    try {
      const raw = await Database.selectTable<MissionData>(MISSION);
      return Promise.resolve(
        raw.map((i) => {
          const ins = new MissionInstance(i);
          ins.completed = true;
          return ins;
        }),
      );
    } catch (e) {
      return Promise.reject(e);
    }
  },

  async editMission(mission: MissionInstance): Promise<void> {
    try {
      if (mission.completed) {
        await Database.insertTable(MISSION, mission);
        await this.editRemainLiveTime(mission.time);
      } else {
        await Database.deleteTable(MISSION, { id: mission.id });
        await this.editRemainLiveTime(-mission.time);
      }
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  async getUserData(): Promise<UserData> {
    const { value } = await Preferences.get({ key: USER });
    if (!value) {
      const newData = {
        name: "",
        dob: "",
        sex: "",
        height: 0,
        weight: 0,
        sexualOrientation: "",
      };
      await Preferences.set({ key: USER, value: JSON.stringify(newData) });
      return Promise.resolve(newData);
    }
    return Promise.resolve(JSON.parse(value));
  },

  async saveUserData(data: UserData): Promise<void> {
    await Preferences.set({ key: USER, value: JSON.stringify(data) });
    return Promise.resolve();
  },

  async getRemainLiveTime(): Promise<number> {
    const { value } = await Preferences.get({ key: REMAINLIVE });
    const startDate = new Date("2000-01-01T00:00:00");
    if (!value) {
      const futureDate = new Date(startDate);
      futureDate.setFullYear(startDate.getFullYear() + 85);
      await Preferences.set({
        key: REMAINLIVE,
        value: futureDate.toISOString(),
      });
      return Promise.resolve(futureDate.getTime());
    }
    return Promise.resolve(new Date(value).getTime() - startDate.getTime());
  },

  async editRemainLiveTime(
    time: number,
    isIncrement: boolean = true,
  ): Promise<void> {
    const { value } = await Preferences.get({ key: REMAINLIVE });
    if (!value) return Promise.resolve();

    const oldDate = new Date(value);
    const newTime = isIncrement
      ? new Date(oldDate.getTime() + time)
      : new Date(time);
    await Preferences.set({
      key: REMAINLIVE,
      value: newTime.toString(),
    });
    document.dispatchEvent(new Event(EventEnum.ChangeTime));
    return Promise.resolve();
  },

  async getDeathMoment(): Promise<Date> {
    const { value } = await Preferences.get({ key: REMAINLIVE });
    if (!value) {
      return Promise.resolve(new Date());
    }
    return Promise.resolve(new Date(value));
  },

  async editRemainLiveTimeBackground(
    time: number,
    isIncrement: boolean = true,
  ): Promise<void> {
    const oldRemainLive = await this.getRemainLiveTime();
    const newTime = isIncrement ? oldRemainLive + time : time;
    await Preferences.set({
      key: REMAINLIVE,
      value: newTime.toString(),
    });
    return Promise.resolve();
  },

  async getBucketList() {
    const res = (await Database.selectTable<BucketItemData>(BUCKET)) ?? [];
    return res as BucketItemData[];
  },

  async createBucketItem(name: string): Promise<void> {
    const item: BucketItemData = {
      id: uuidv4(),
      label: name,
      completed: false,
    };
    await Database.insertTable(BUCKET, item);
    return Promise.resolve();
  },

  async editBucketItem(item: BucketItemData): Promise<void> {
    await Database.updateTable(BUCKET, { id: item.id }, item);
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
