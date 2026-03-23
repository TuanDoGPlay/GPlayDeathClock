import type { Component } from "vue";
import DeathStory from "@/screens/share-clock/templates/DeathStory.vue";
import SaveADate from "@/screens/share-clock/templates/SaveADate.vue";
import type {
  QuestionInstance,
  SelectRandomAnswerLogic,
  SliderOffsetAnswerLogic,
  TextRandomAnswerLogic,
  ValueMatchAnswerLogic,
} from "./types";
import { QuestionMethodEnum } from "@/constants/questionMethod";

export const MS_IN_SECOND = 1000;
export const MS_IN_MINUTE = 60 * MS_IN_SECOND;
export const MS_IN_HOUR = 60 * MS_IN_MINUTE;
export const MS_IN_DAY = 24 * MS_IN_HOUR;
export const MS_IN_WEEK = 7 * MS_IN_DAY;
export const MS_IN_MONTH = 30 * MS_IN_DAY;
export const MS_IN_YEAR = 365 * MS_IN_DAY;

export interface ShareTemplate {
  id: number;
  title: string;
  image: string;
  component: Component;
}

const shareTemplateMapping = new Map<number, ShareTemplate>([
  [
    1,
    {
      id: 1,
      title: "Death Story",
      image: "/templates/death-story/thumbnail.png",
      component: DeathStory,
    },
  ],
  [
    2,
    {
      id: 2,
      title: "Save a Date",
      image: "/templates/save-a-date/thumbnail.png",
      component: SaveADate,
    },
  ],
]);

export const Utils = {
  getAllShareTemplates: (): ShareTemplate[] => {
    return Array.from(shareTemplateMapping.values());
  },
  getShareTemplateComponentById: (id: number): Component | undefined => {
    return shareTemplateMapping.get(id)?.component;
  },
  formatNumber(number: number, decimals = 2): number {
    if (!number || isNaN(number)) return 0;

    // Sử dụng lũy thừa của 10 tương ứng với số chữ số thập phân
    const factor = Math.pow(10, decimals);

    // Nhân lên -> Làm tròn -> Chia lại để giữ đúng số chữ số thập phân ở kiểu number
    return Math.floor(number * factor) / factor;
  },
  formatFullDuration: (totalSeconds: number) => {
    if (totalSeconds === 0) return "0 seconds";

    // Định nghĩa hằng số giây cho từng đơn vị (Dựa trên năm 365 ngày, tháng 30 ngày)
    const units = [
      { label: "year", seconds: 31536000 },
      { label: "month", seconds: 2592000 }, // 30 ngày
      { label: "week", seconds: 604800 },
      { label: "day", seconds: 86400 },
      { label: "hour", seconds: 3600 },
      { label: "minute", seconds: 60 },
      { label: "second", seconds: 1 },
    ];

    let remaining = totalSeconds;
    const parts: string[] = [];

    units.forEach((unit) => {
      const value = Math.floor(remaining / unit.seconds);
      if (value > 0) {
        parts.push(`${value} ${unit.label}${value > 1 ? "s" : ""}`);
        remaining %= unit.seconds;
      }
    });

    return parts.join(" ");
  },
  formatShortDuration(seconds: number): string {
    if (seconds <= 0) return "0s";

    const units = [
      { label: "y", value: MS_IN_YEAR }, // 365 * 24 * 60 * 60
      { label: "mo", value: MS_IN_MONTH }, // 30 * 24 * 60 * 60
      { label: "d", value: MS_IN_DAY }, // 24 * 60 * 60
      { label: "h", value: MS_IN_HOUR },
      { label: "m", value: MS_IN_MINUTE },
      { label: "s", value: MS_IN_SECOND },
    ];

    const result: string[] = [];
    let remainingSeconds = seconds;

    for (const { label, value } of units) {
      const amount = Math.floor(remainingSeconds / value);
      if (amount > 0) {
        result.push(`${amount}${label}`);
        remainingSeconds %= value;
      }

      // Dừng lại khi đã lấy đủ 2 đơn vị
      if (result.length === 2) break;
    }

    return result.join(" ");
  },
  calculateBMI(weight: number, height: number): number {
    // Nếu người dùng nhập chiều cao theo cm (ví dụ 170), tự động chuyển sang m (1.7)
    const heightInMeters = height > 3 ? height / 100 : height;
    const bmi = weight / (heightInMeters * heightInMeters);
    const roundedBMI = Math.round(bmi * 10) / 10; // Làm tròn 1 chữ số thập phân
    return roundedBMI;
  },
  convertStringToMs(timeStr: string): number {
    // Regex mới: ^([+-]?) cho phép có dấu + hoặc - ở đầu (không bắt buộc)
    const match = timeStr.match(/^([+-]?)(\d+)([a-zA-Z]+)$/);

    if (!match || !match[2] || !match[3]) return 0;

    const sign = match && match[1] === "-" ? -1 : 1; // Xác định dấu
    const value = parseInt(match[2]);
    const unit = match[3].toLowerCase();

    let ms = 0;

    switch (unit) {
      case "s":
        ms = value * MS_IN_SECOND;
        break;
      case "m":
        ms = value * MS_IN_MINUTE;
        break;
      case "h":
        ms = value * MS_IN_HOUR;
        break;
      case "d":
        ms = value * MS_IN_DAY;
        break;
      case "mo":
        ms = value * MS_IN_MONTH;
        break;
      case "y":
        ms = value * MS_IN_YEAR;
        break;
      default:
        return 0;
    }

    return ms * sign; // Nhân với dấu để trả về số âm hoặc dương
  },

  calculateQuestionIncrementTime(
    question: QuestionInstance,
    answer: any,
  ): number {
    let increment = 0;

    if (answer) {
      if (question.method === QuestionMethodEnum.TextRandom) {
        const logic = question.logic as TextRandomAnswerLogic;
        const fromNumber = Utils.convertStringToMs(logic.from);
        const toNumber = Utils.convertStringToMs(logic.to);
        increment = Math.random() * (toNumber - fromNumber) + fromNumber;
      } else if (question.method === QuestionMethodEnum.SelectRandom) {
        const logic = question.logic as SelectRandomAnswerLogic;
        const index = question.options?.findIndex(
          (option) => option === answer,
        );
        if (index !== undefined && index >= 0 && logic.random[index]) {
          const randomLogic = logic.random[index];
          const fromNumber = Utils.convertStringToMs(randomLogic.from);
          const toNumber = Utils.convertStringToMs(randomLogic.to);
          increment = Math.random() * (toNumber - fromNumber) + fromNumber;
        }
      } else if (question.method === QuestionMethodEnum.SliderOffset) {
        const logic = question.logic as SliderOffsetAnswerLogic;
        const val = Number(answer);
        const [minIdeal, maxIdeal] = logic.ideal;

        if (val >= minIdeal && val <= maxIdeal) {
          const fromBonus = Utils.convertStringToMs(logic.bonus.from);
          const toBonus = Utils.convertStringToMs(logic.bonus.to);
          increment = Math.random() * (toBonus - fromBonus) + fromBonus;
        } else {
          const offset = val < minIdeal ? minIdeal - val : val - maxIdeal;
          const penaltyMs = Utils.convertStringToMs(logic.penaltyPerHour);
          increment = offset * penaltyMs;
        }
      } else if (question.method === QuestionMethodEnum.ValueMatch) {
        const logic = question.logic as ValueMatchAnswerLogic;
        const val = Number(answer);
        const matchedRule = logic.rules.find((rule) =>
          rule.values.includes(val),
        );

        if (matchedRule) {
          const fromNumber = Utils.convertStringToMs(matchedRule.from);
          const toNumber = Utils.convertStringToMs(matchedRule.to);
          increment = Math.random() * (toNumber - fromNumber) + fromNumber;
        }
      }
    }

    return Math.max(increment, MS_IN_MONTH);
  },
  isNewDay(lastSavedDate: string): boolean {
    const today = new Date().toISOString().split("T")[0]; // Lấy định dạng "2026-03-09"
    return today !== lastSavedDate;
  },

  formatShortenDuration(totalMs: number): string {
    if (!totalMs || totalMs === 0) return "0 seconds";

    // Đảm bảo xử lý đúng số âm nếu có (chỉ lấy độ lớn)
    let remainingMs = Math.abs(totalMs);

    // Sử dụng trực tiếp các hằng số ms đã khai báo ở đầu file
    const units = [
      { label: "year", value: MS_IN_YEAR },
      { label: "month", value: MS_IN_MONTH },
      { label: "week", value: MS_IN_WEEK },
      { label: "day", value: MS_IN_DAY },
      { label: "hour", value: MS_IN_HOUR },
      { label: "minute", value: MS_IN_MINUTE },
      { label: "second", value: MS_IN_SECOND },
    ];

    for (const unit of units) {
      const amount = Math.floor(remainingMs / unit.value);
      if (amount > 0) {
        // Trả về ngay lập tức đơn vị lớn nhất tìm được
        return `${amount} ${unit.label}${amount > 1 ? "s" : ""}`;
      }
    }

    // Trường hợp số ms quá nhỏ (dưới 1 giây)
    return "0 seconds";
  },
};
