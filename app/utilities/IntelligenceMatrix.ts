import DBInstance from "@/app/utilities/db-instance";
import { RewardOutcome, ActionOutcome, Obj, ACTIONS } from "./Types";

// INPUT (state of the world) -> OUTPUT (action to maximize rewards)

class IntelligenceMatrix {
  db;

  constructor() {
    this.db = DBInstance.getDBInstance();
  }

  async analyzeOutcomes(
    rewardOutcomes: Array<RewardOutcome>,
    actionOutcomes: Array<ActionOutcome>
  ) {
    await this.db.prune();

    console.log(rewardOutcomes);
    console.log(actionOutcomes);
  }

  selectAction(objects: Array<Obj>) {
    const randomActionIdx = Math.floor(Math.random() * ACTIONS.length);
    return ACTIONS[randomActionIdx];
  }
}

export default IntelligenceMatrix;
