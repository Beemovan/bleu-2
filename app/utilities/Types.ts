export type BrainStatus = "Thinking" | "Paused";

export const ACTIONS = [
  "move-left",
  "move-right",
  "move-up",
  "move-down",
] as const;

export type Action = (typeof ACTIONS)[number];

export type Obj = {
  x: number;
  y: number;
};

export type ObjChange = {
  prev: Partial<Obj>;
  cur: Partial<Obj>;
};

export type ObjChangeMap = Record<number, ObjChange>;

export type RewardMechanism = {
  evaluate: (objChangeMap: ObjChangeMap) => number;
};

export type Outcome = {
  action: Action;
  worldState: ObjChangeMap;
  rewards: Array<number>;
};
