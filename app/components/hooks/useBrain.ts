import { useMemo } from "react";

const ACTIONS = ["move-left", "move-right"] as const;

type Action = (typeof ACTIONS)[number];

type Object = {
  x: number;
  y: number;
};

type RewardMechanism = { evaluate: () => number };

class ElController {
  el;
  pos = [0, 0];

  constructor(el: HTMLDivElement) {
    this.el = el;
  }

  moveLeft() {
    this.pos[0]--;
    this.move("x");
  }

  moveRight() {
    this.pos[0]++;
    this.move("x");
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
      case "move-right":
        this.moveRight();
      default:
        break;
    }
  }
}

class Sandbox {
  el;
  objects: Array<Object> = [];

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
}

const calcDiff = (o1: Object, o2: Object) =>
  (Object.keys(o1) as Array<keyof typeof o1>).reduce((diff, key) => {
    if (o2[key] === o1[key]) return diff;
    return {
      ...diff,
      [key]: o1[key],
    };
  }, {});

function getObjectChanges(objects: Array<Object>, newObjects: Array<Object>) {
  return objects.reduce((changeMap, obj, idx) => {
    const changes = calcDiff(obj, newObjects[idx]);
    if (Object.keys(changes).length) changeMap[idx] = changes;
    return changeMap;
  }, {} as Record<number, Partial<Object>>);
}

class Brain {
  controller;
  world;
  rewardMechanisms;
  //   rewards;

  constructor(
    controller: ElController,
    sandbox: Sandbox,
    rewardMechanisms: Array<RewardMechanism> = []
  ) {
    this.controller = controller;
    this.world = sandbox;
    this.rewardMechanisms = rewardMechanisms;
    // this.rewards = new Array<number>(rewardMechanisms.length).fill(0);
  }

  observeWorld() {
    this.world.updateObjects();
    return this.world.objects;
  }

  performAction(objects: Array<Object>) {
    const action = ACTIONS[1];
    this.controller.performAction(action);
    return action;
  }

  processOutcome(
    objects: Array<Object>,
    newObjects: Array<Object>,
    action: Action
  ) {
    const changes = getObjectChanges(objects, newObjects);
    console.log(changes);
    const rewards = this.rewardMechanisms.map(({ evaluate }) => evaluate());
  }

  think() {
    const objects = this.observeWorld();
    const action = this.performAction(objects);
    const newObjects = this.observeWorld();
    this.processOutcome(objects, newObjects, action);
  }
}

export const useBrain = (el: HTMLDivElement | null) => {
  const brain = useMemo(() => {
    if (!el) return null;
    const elController = new ElController(el);
    const sandbox = new Sandbox();
    return new Brain(elController, sandbox);
  }, [el]);

  return brain;
};
