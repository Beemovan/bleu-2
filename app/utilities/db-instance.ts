// import VectorDB from "@themaximalist/vectordb.js";
import { VectorDB } from "@/app/utilities/vectorDB/db";

class DBInstance {
  private static instance: DBInstance | null = null;
  private db: any;

  private constructor() {
    this.initializeDB();
  }

  public static getDBInstance() {
    if (!DBInstance.instance) {
      DBInstance.instance = new DBInstance();
    }
    return DBInstance.instance.db;
  }

  private async initializeDB() {
    const db = new VectorDB({
      vectorPath: "embedding",
    });

    const key1 = await db.insert({
      embedding: [1, 2, 3],
      text: "ASDASINDASDASZd",
    });
    const key2 = await db.insert({ embedding: [2, 3, 4], text: "GTFSDGRG" });
    const key3 = await db.insert({
      embedding: [73, -213, 3],
      text: "hYTRTERFR",
    });

    await db.update(key2, { embedding: [2, 3, 4], text: "UPDATED" });
    await db.delete(key3);

    // Query returns a list ordered by the entries closest to the vector (cosine similarity)
    console.log(await db.query([1, 2, 3], { limit: 20 }));
    this.db = db;
  }
}

export default DBInstance;
