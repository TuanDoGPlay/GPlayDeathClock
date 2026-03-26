import "./assets/styles/index.css";
import "@gplay/app-sdk/style.css";
import { init, type ProjectConfigData } from "@gplay/app-sdk";
import AppLayout from "@/screens/AppLayout.vue";
import { CommonController } from "@/common/controller.ts";

const config: ProjectConfigData = {
  layout: {
    component: AppLayout,
  },
  defaultScreen: {
    home: () => import("./screens/home/HomeScreen.vue"),
  },
  additionalRouter: [
    {
      name: "question",
      path: "question",
      component: () => import("@/screens/question/QuestionScreen.vue"),
    },
    {
      name: "share-clock",
      path: "share-clock",
      component: () => import("@/screens/share-clock/ShareClockScreen.vue"),
    },
    {
      name: "share-clock-detail",
      path: "/share-clock-detail/:id",
      component: () => import("@/screens/share-clock-detail/ShareClockDetail.vue"),
    },
    {
      name: "share-ritual",
      path: "share-ritual",
      component: () => import("@/screens/share-ritual/ShareRitualScreen.vue"),
    },
  ],
  app: {
    id: "com.gcognify.tik.die.tok.death.clock",
    name: "Death Clock",
  },
  color: {
    background: "#101010",
    primaryText: "#000000",
  },
  applovin: {
    android: {
      sdkKey:
        "eQt0q3679KmUyKeNcSzqC01eB-lILmfTnJoufGxpSn__n1NVhHLeMgxZOaICke451El4ZBfuZum9Qw4WxzpW52",
      rewarded: "b08a5b4a1640b3f0",
      banner: "70701dca4c7d3bd6",
      mrec: "277fe98684d6e92d",
    },
  },
  appsflyer: {
    devKey: "XM6HPCReBAqLH5uCaQHRDY",
  },
};
init(config);
CommonController.init().then();
