import {Database} from "gplay-app-sdk";
import requiredQuestions from "@/assets/data/required-questions.json";
import questions from "@/assets/data/questions.json";
import {
    type BucketItemData,
    type MissionData,
    MissionInstance,
    QuestionInstance,
    type UserData
} from "@/common/types.ts";
import {ref} from "vue";
import {Preferences} from "@capacitor/preferences";
import {v4 as uuidv4} from 'uuid';
import dailyMissions from "@/assets/data/daily-missions.json";

const userData = ref<UserData>({
    name: '',
    dob: '',
    sex: '',
    height: 0,
    weight: 0,
    sexualOrientation: '',
    remainTime: 0,
})
const userTable = 'user'
const bucketTable = 'buckets'
const missionTable = 'missions'

export const CommonController = {
    async init() {
        const db = {
            [userTable]: [{
                id: 1,
                ...userData.value
            }],
            [bucketTable]: [],
            [missionTable]: [],
        }
        await Database.initDatabase(db)
    },

    async getQuestions(): Promise<QuestionInstance[]> {
        const {value} = await Preferences.get({key: 'visited'})
        if (value == 'true') return questions.slice(0, 10).map(q => new QuestionInstance(q))
        return requiredQuestions.map(q => new QuestionInstance(q))
    },

    async getDailyMission(): Promise<MissionInstance[]> {
        try {
            const raw = await Database.selectTable<MissionData>(missionTable) ?? []
            const missions = dailyMissions.map(m => new MissionInstance(m))
            missions.forEach(m => {
                m.completed = raw.some(r => r.id === m.id);
            });

            const completedMissions = missions.filter(m => m.completed);
            const uncompletedMissions = missions.filter(m => !m.completed);

            return Promise.resolve([...uncompletedMissions.slice(0, 5), ...completedMissions])
        } catch (e) {
            return Promise.reject(e)
        }
    },

    async editMission(mission: MissionInstance) {
        try {
            if (mission.completed) {
                await Database.insertTable(missionTable, mission)
                await Database.updateTable(userTable, {id: 1}, {remainTime: userData.value.remainTime + mission.time})
            } else {
                await Database.deleteTable(missionTable, {id: mission.id})
                await Database.updateTable(userTable, {id: 1}, {remainTime: userData.value.remainTime - mission.time})
            }
        } catch (e) {
            return Promise.reject(e)
        }
    },

    getUserData() {
        return userData.value
    },


    async saveUserData(data: UserData) {
        userData.value = data
        console.log(userData.value)
        await Database.updateTable(userTable, {id: 1}, userData.value)
    },

    async getBucketList() {
        const res = await Database.selectTable(bucketTable) ?? []
        return res as BucketItemData[]
    },

    async createBucketItem(name: string): Promise<void> {
        const item: BucketItemData = {id: uuidv4(), label: name, completed: false}
        await Database.insertTable(bucketTable, item)
        return Promise.resolve()
    },

    async editBucketItem(item: BucketItemData): Promise<void> {
        await Database.updateTable(bucketTable, {id: item.id}, item)
        return Promise.resolve()
    }
}