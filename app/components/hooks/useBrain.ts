import IntelligenceMatrix from "@/app/utilities/IntelligenceMatrix";
import {
  Action,
  Obj,
  ObjChangeMap,
  Outcome,
  RewardMechanism,
} from "@/app/utilities/Types";
import { useMemo } from "react";

class ElController {
  el;
  pos = [0, 0];

  constructor(el: HTMLDivElement, sandbox?: Sandbox) {
    this.el = el;

    if (sandbox) {
      const elBounds = el.getBoundingClientRect();
      const elSize = Math.floor(elBounds.width / 2);
      this.pos[0] = Math.floor(sandbox.getBounds().width / 2) - elSize;
      this.pos[1] = Math.floor(sandbox.getBounds().height / 2) - elSize;
      this.move("x");
      this.move("y");
    }
  }

  moveLeft() {
    this.pos[0]--;
    this.move("x");
  }

  moveRight() {
    this.pos[0]++;
    this.move("x");
  }

  moveUp() {
    this.pos[1]--;
    this.move("y");
  }

  moveDown() {
    this.pos[1]++;
    this.move("y");
  }

  move(dir: "x" | "y") {
    if (!this.el) return;
    this.el.style[dir === "x" ? "left" : "top"] = `${
      this.pos[dir === "x" ? 0 : 1]
    }px`;
  }

  performAction(action: Action) {
    switch (action) {
      case "move-left":
        this.moveLeft();
        break;
      case "move-right":
        this.moveRight();
        break;
      case "move-up":
        this.moveUp();
        break;
      case "move-down":
        this.moveDown();
        break;
      default:
        break;
    }
  }
}

class Sandbox {
  el;
  objects: Array<Obj> = [];

  constructor() {
    this.el = document.getElementById("sandbox") as HTMLElement;
  }

  updateObjects() {
    this.objects = this.el
      ? [...this.el.children].map((child) => {
          const { x, y } = child.getBoundingClientRect();
          return { x, y };
        })
      : [];
  }

  getBounds() {
    return this.el.getBoundingClientRect();
  }
}

const reduceObjectsToChanges = (o1: Obj, o2: Obj) => {
  (Object.keys(o2) as Array<keyof typeof o2>).reduce((diff, key) => {
    if (o2[key] === o1[key]) return diff;
    return {
      ...diff,
      [key]: o2[key],
    };
  }, {});

  const prev: Partial<Obj> = {};
  const cur: Partial<Obj> = {};

  (Object.keys(o2) as Array<keyof typeof o2>).forEach((key) => {
    if (o2[key] === o1[key]) return;
    prev[key] = o1[key];
    cur[key] = o2[key];
  });

  return { prev, cur };
};

function getObjectChanges(objects: Array<Obj>, newObjects: Array<Obj>) {
  return objects.reduce((changeMap, obj, idx) => {
    const objChange = reduceObjectsToChanges(obj, newObjects[idx]);
    if (Object.keys(objChange.cur).length) changeMap[idx] = objChange;
    return changeMap;
  }, {} as ObjChangeMap);
}

class Memory {
  MAX_MEMORY_LEN = 1000;
  outcomes: Array<Outcome>;
  intelligenceMatrix: IntelligenceMatrix;
  memoriesSinceAnalysis = 0;

  constructor() {
    this.outcomes = [];
    this.intelligenceMatrix = new IntelligenceMatrix();
  }

  async remember(
    action: Action,
    objChangeMap: ObjChangeMap,
    rewards: Array<number>
  ) {
    if (this.outcomes.length >= this.MAX_MEMORY_LEN) this.outcomes.shift();

    const outcome = {
      action,
      worldState: objChangeMap,
      rewards,
    };

    this.outcomes.push(outcome);

    await this.intelligenceMatrix.analyzeOutcome(outcome);

    // if (++this.memoriesSinceAnalysis >= 5) {
    //   this.memoriesSinceAnalysis = 0;
    //   await this.intelligenceMatrix.analyzeOutcomes(
    //     this.outcomes,
    //   );
    // }
  }

  selectAction(objects: Array<Obj>) {
    return this.intelligenceMatrix.selectAction(objects);
  }
}

class Brain {
  controller;
  world;
  rewardMechanisms;
  memory;

  constructor(
    controller: ElController,
    sandbox: Sandbox,
    rewardMechanisms: Array<RewardMechanism> = []
  ) {
    this.controller = controller;
    this.world = sandbox;
    this.rewardMechanisms = rewardMechanisms;
    this.memory = new Memory();
  }

  observeWorld() {
    this.world.updateObjects();
    return this.world.objects;
  }

  performAction(objects: Array<Obj>) {
    const action = this.memory.selectAction(objects);
    this.controller.performAction(action);
    return action;
  }

  processOutcome(objects: Array<Obj>, newObjects: Array<Obj>, action: Action) {
    const objChangeMap = getObjectChanges(objects, newObjects);
    const rewards = this.rewardMechanisms.map(({ evaluate }) =>
      evaluate(objChangeMap)
    );
    this.memory.remember(action, objChangeMap, rewards);
  }

  think() {
    const objects = this.observeWorld();
    const action = this.performAction(objects);
    const newObjects = this.observeWorld();
    this.processOutcome(objects, newObjects, action);
  }
}

const seedRewardMechanisms = (): Array<RewardMechanism> => {
  return [
    {
      evaluate: (objChangeMap: ObjChangeMap) => {
        const x = objChangeMap["0"]?.cur?.x;
        if (x === undefined) return -1;
        const xGoal = 200;
        const maxScore = 100;
        const delta = Math.abs(xGoal - x) / 5;
        return Math.max(maxScore - delta, 0);
      },
    },
  ];
};

export const useBrain = (el: HTMLDivElement | null) => {
  const brain = useMemo(() => {
    if (!el) return null;
    const sandbox = new Sandbox();
    const elController = new ElController(el, sandbox);
    const rewardMechanisms = seedRewardMechanisms();
    return new Brain(elController, sandbox, rewardMechanisms);
  }, [el]);

  return brain;
};
