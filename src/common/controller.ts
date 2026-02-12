import {Database} from "gplay-app-sdk";
import dailyMissions from "@/assets/data/daily-missions.json";
import requiredQuestions from "@/assets/data/required-questions.json";
import questions from "@/assets/data/questions.json";
import {type BucketItemData, MissionInstance, QuestionInstance, type UserData} from "@/common/types.ts";
import {ref} from "vue";
import {Preferences} from "@capacitor/preferences";

const userData = ref<UserData>({
    name: '',
    dob: '',
    sex: '',
    height: 0,
    weight: 0,
    sexualOrientation: ''
})
const userTable = 'user'

export const CommonController = {
    async init() {
        const db = {
            userTable: {
                id: 1,
                ...userData.value
            }
        }
        await Database.initDatabase(db)
    },

    async getQuestions(): Promise<QuestionInstance[]> {
        const {value} = await Preferences.get({key: 'visited'})
        if (value == 'true') return questions.slice(0, 10).map(q => new QuestionInstance(q))
        return requiredQuestions.map(q => new QuestionInstance(q))
    },

    getDailyMission(): MissionInstance[] {
        return dailyMissions.map(m => new MissionInstance(m))
    },

    getUserData() {
        return userData.value
    },


    async saveUserData(data: UserData) {
        userData.value = data
        await Database.updateTable(userTable, {id: 1}, userData.value)
    },

    async getBucketList() {
        const {value} = await Preferences.get({key: 'bucket'})
        const res = value ? JSON.parse(value) : []
        return res as BucketItemData[]
    },

    async createBucketItem(item: BucketItemData): Promise<void> {
        const bucketList = await this.getBucketList()
        bucketList.push(item)
        await Preferences.set({key: 'bucket', value: JSON.stringify(bucketList)})
        return Promise.resolve()
    },

    async editBucketItem(item: BucketItemData): Promise<void> {
        const bucketList = await this.getBucketList()
        const index = bucketList.findIndex(i => i.id === item.id)
        bucketList[index] = item
        await Preferences.set({key: 'bucket', value: JSON.stringify(bucketList)})
        return Promise.resolve()
    }
}