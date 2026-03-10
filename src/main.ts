import "./assets/styles/index.css";
import "gplay-app-sdk/style.css";
import { init, type ProjectConfigData } from "gplay-app-sdk";
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
      name: "share-ritual",
      path: "share-ritual",
      component: () => import("@/screens/share-ritual/ShareRitualScreen.vue"),
    },
  ],
  app: {
    id: "com.gcognify.death-clock",
    name: "Death Clock",
  },
  color: {
    background: "#101010",
    primaryText: "#000000",
  },
};
init(config);
CommonController.init().then();
