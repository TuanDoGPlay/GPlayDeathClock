import { Database } from "gplay-app-sdk";
import requiredQuestions from "@/assets/data/required-questions.json";
import questions from "@/assets/data/questions.json";
import {
  type BucketItemData,
  type MissionData,
  MissionInstance,
  QuestionInstance,
  type UserData,
} from "@/common/types.ts";
import { ref } from "vue";
import { Preferences } from "@capacitor/preferences";
import { v4 as uuidv4 } from "uuid";
import dailyMissions from "@/assets/data/daily-missions.json";

const userTable = "user";
const bucketTable = "buckets";
const missionTable = "missions";

export const CommonController = {
  async init() {
    const db = {
      [userTable]: [
        {
          id: 1,
          name: "",
          dob: "",
          sex: "",
          height: 0,
          weight: 0,
          sexualOrientation: "",
          remainTime: 0,
        },
      ],
      [bucketTable]: [],
      [missionTable]: [],
    };
    await Database.initDatabase(db);
  },

  async getQuestions(): Promise<QuestionInstance[]> {
    const { value } = await Preferences.get({ key: "visited" });
    if (value == "true")
      return questions.slice(0, 10).map((q) => new QuestionInstance(q));
    return requiredQuestions.map((q) => new QuestionInstance(q));
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

      return Promise.resolve([
        ...uncompletedMissions.slice(0, 5),
        ...completedMissions,
      ]);
    } catch (e) {
      return Promise.reject(e);
    }
  },

  async editMission(mission: MissionInstance) {
    try {
      const userData = await this.getUserData();
      if (mission.completed) {
        await Database.insertTable(missionTable, mission);
        await Database.updateTable(
          userTable,
          { id: 1 },
          { remainTime: userData.remainTime + mission.time },
        );
      } else {
        await Database.deleteTable(missionTable, { id: mission.id });
        await Database.updateTable(
          userTable,
          { id: 1 },
          { remainTime: userData.remainTime - mission.time },
        );
      }
    } catch (e) {
      return Promise.reject(e);
    }
  },

  async getUserData(): Promise<UserData> {
    const res = await Database.selectTable<UserData>(userTable);
    if (!res[0]) {
      return Promise.resolve({
        name: "",
        dob: "",
        sex: "",
        height: 0,
        weight: 0,
        sexualOrientation: "",
        remainTime: 0,
      });
    }
    return Promise.resolve(res[0]);
  },

  async saveUserData(data: UserData) {
    await Database.updateTable(userTable, { id: 1 }, data);
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
      userData.name ||
      userData.dob ||
      userData.sex ||
      userData.height ||
      userData.weight ||
      userData.sexualOrientation
    ) {
      return false;
    }
    return true;
  },
};
