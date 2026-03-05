import type { InjectionKey, Ref, ComputedRef } from "vue";

export type Pane = { uid: number; name: string; el?: HTMLElement | null };

export type TabsContext = {
  registerPane: (pane: Pane) => void;
  unregisterPane: (uid: number) => void;
  activeName: Ref<string>;
  swipe: ComputedRef<boolean>;
};

export const TABS_KEY: InjectionKey<TabsContext> = Symbol("TABS_KEY");
