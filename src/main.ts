import './assets/styles/index.css'
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
    color: {
        background:'#101010',
        primaryText:'#000000',
    }
}
init(config)