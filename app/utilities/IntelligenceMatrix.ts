import { ACTIONS, Obj, Outcome } from "./Types";

// INPUT (state of the world + action) -> OUTPUT (next state of the world)

// INPUT (state of the world) -> OUTPUT (action)

type Connection = { strength: number; parent: Node; child: Node };

type Region = {
  name: string;
  nodes: Array<Node>;
  inputRange: [number, number];
};

class Node {
  bias: number;
  connections: Array<Connection>;

  constructor() {
    this.bias = 3;
    this.connections = [];
  }
}

class IntelligenceMatrix {
  allNodes: Array<Node> = [];
  inputLayer: Array<Node> = [];
  outputLayer: Array<Node> = [];
  regions: Array<Region> = [];

  constructor(regions: Array<{ name: string; len: number }>) {}

  async analyzeOutcome(outcome: Outcome) {
    const { action, worldState, rewards } = outcome;
  }

  selectAction(objects: Array<Obj>) {
    const randomActionIdx = Math.floor(Math.random() * ACTIONS.length);
    return ACTIONS[randomActionIdx];
  }
}

export default IntelligenceMatrix;
