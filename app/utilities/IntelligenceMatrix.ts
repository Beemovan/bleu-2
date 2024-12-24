import { RewardOutcome, ActionOutcome, Obj, ACTIONS } from "./Types";

// INPUT (state of the world) -> OUTPUT (action to maximize rewards)

class IntelligenceMatrix {
  constructor() {}

  analyzeOutcomes(
    rewardOutcomes: Array<RewardOutcome>,
    actionOutcomes: Array<ActionOutcome>
  ) {
    console.log(rewardOutcomes);
    console.log(actionOutcomes);
  }

  selectAction(objects: Array<Obj>) {
    const randomActionIdx = Math.floor(Math.random() * ACTIONS.length);
    return ACTIONS[randomActionIdx];
  }
}

export default IntelligenceMatrix;
