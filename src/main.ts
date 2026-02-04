import './assets/styles/tailwind.css'
import "gplay-app-sdk/style.css";
import {init, type ProjectConfigData} from "gplay-app-sdk"


const config: ProjectConfigData = {
    navbar: {
        enable: false,
    },
    defaultScreen: {
        home: () => import('./screens/home/HomeScreen.vue')
    },
    app: {
        id: 'com.gcognify.death-clock',
        name: 'Death Clock'
    },
    additionalRouter:[{
        name:'profile',
        path:'/profile',
        component: () => import('./screens/profile/ProfileScreen.vue')
    }],
}
init(config)