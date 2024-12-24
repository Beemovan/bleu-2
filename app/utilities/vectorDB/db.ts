const DB_DEFAUlTS = {
  dbName: "vectorDB",
  objectStore: "vectors",
};

type Options = { dbName?: any; objectStore?: any; vectorPath?: any };

// Nabbed from lodash
class SortedArray extends Array {
  #maxLength;
  #keyPath;

  constructor(maxLength = 0, keyPath: string) {
    super();
    this.#maxLength = maxLength;
    this.#keyPath = keyPath;
  }

  push(...items: any[]) {
    throw new Error("Can't push on to a sorted array");
    return -1;
  }

  unshift(...items: any[]) {
    throw new Error("Can't unshift on to a sorted array");
    return -1;
  }

  insert(value: any) {
    const array = this;
    const maxLength = this.#maxLength;
    let low = 0,
      high = array == null ? low : array.length;

    const accessor =
      typeof value == "object"
        ? (array: SortedArray, mid: number) => array[mid][this.#keyPath]
        : (array: SortedArray, mid: number) => array[mid];
    const resolvedValue =
      typeof value == "object" ? value[this.#keyPath] : value;

    while (low < high) {
      let mid = (low + high) >>> 1;
      let computed = accessor(array, mid);

      if (computed !== null && computed >= resolvedValue) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }

    this.splice(high, 0, value);

    if (this.length > maxLength) {
      this.pop(); // Remove the last entry to make way for the new one
    }
  }
}

function cosineSimilarity(a: any, b: any) {
  const dotProduct = a.reduce(
    (sum: number, aVal: any, idx: number) => sum + aVal * b[idx],
    0
  );
  const aMagnitude = Math.sqrt(
    a.reduce((sum: number, aVal: any) => sum + aVal * aVal, 0)
  );
  const bMagnitude = Math.sqrt(
    b.reduce((sum: number, bVal: any) => sum + bVal * bVal, 0)
  );
  return dotProduct / (aMagnitude * bMagnitude);
}

async function create(options: Options) {
  const { dbName, objectStore, vectorPath } = {
    ...DB_DEFAUlTS,
    ...options,
  };
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(dbName, 1);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      const store = db.createObjectStore(objectStore, { autoIncrement: true });
      store.createIndex(vectorPath, vectorPath, { unique: false });
    };

    request.onsuccess = (event: any) => {
      resolve(event.target.result);
    };

    request.onerror = (event: any) => {
      reject(event.target.error);
    };
  });
}

class VectorDB {
  #objectStore;
  #vectorPath;
  #db: any;

  constructor(options: Options) {
    const { dbName, objectStore, vectorPath } = {
      ...DB_DEFAUlTS,
      ...options,
    };

    if (!dbName) {
      // Note only used in create()
      throw new Error("dbName is required");
    }

    if (!objectStore) {
      throw new Error("objectStore is required");
    }

    if (!vectorPath) {
      throw new Error("vectorPath is required");
    }

    this.#objectStore = objectStore;
    this.#vectorPath = vectorPath;

    this.#db = create(options);
  }

  async insert(object: any) {
    if (this.#vectorPath in object == false) {
      throw new Error(
        `${this.#vectorPath} expected to be present 'object' being inserted`
      );
    }

    if (Array.isArray(object[this.#vectorPath]) == false) {
      throw new Error(
        `${this.#vectorPath} on 'object' is expected to be an Array`
      );
    }

    const db = await this.#db;
    const storeName = this.#objectStore;

    const transaction = db.transaction([storeName], "readwrite");
    const store = transaction.objectStore(storeName);

    const request = store.add(object);
    return new Promise((resolve, reject) => {
      request.onsuccess = (event: any) => {
        resolve(event.target.result);
      };

      request.onerror = (event: any) => {
        reject(event.error);
      };
    });
  }

  async delete(key: any) {
    if (key == null) {
      throw new Error(`Unable to delete object without a key`);
    }

    const db = await this.#db;
    const storeName = this.#objectStore;

    const transaction = db.transaction([storeName], "readwrite");
    const store = transaction.objectStore(storeName);

    const request = store.delete(key);

    return new Promise((resolve, reject) => {
      request.onsuccess = (event: any) => {
        resolve(event.target.result);
      };

      request.onerror = (event: any) => {
        reject(event.error);
      };
    });
  }

  async prune() {
    const db = await this.#db;
    const storeName = this.#objectStore;

    const transaction = db.transaction([storeName], "readwrite");
    const store = transaction.objectStore(storeName);

    const request = store.delete(key);

    store;

    return new Promise((resolve, reject) => {
      request.onsuccess = (event: any) => {
        resolve(event.target.result);
      };

      request.onerror = (event: any) => {
        reject(event.error);
      };
    });
  }

  async update(key: any, object: any) {
    if (key == null) {
      throw new Error(`Unable to update object without a key`);
    }

    if (this.#vectorPath in object == false) {
      throw new Error(
        `${this.#vectorPath} expected to be present 'object' being updated`
      );
    }

    if (Array.isArray(object[this.#vectorPath]) == false) {
      throw new Error(
        `${this.#vectorPath} on 'object' is expected to be an Array`
      );
    }

    const db = await this.#db;
    const storeName = this.#objectStore;

    const transaction = db.transaction([storeName], "readwrite");
    const store = transaction.objectStore(storeName);

    const request = store.put(object, key);

    return new Promise((resolve, reject) => {
      request.onsuccess = (event: any) => {
        resolve(event.target.result);
      };

      request.onerror = (event: any) => {
        reject(event.error);
      };
    });
  }

  // Return the most similar items up to [limit] items
  async query(queryVector: Array<number>, options = { limit: 10 }) {
    const { limit } = options;

    const queryVectorLength = queryVector.length;

    const db = await this.#db;
    const storeName = this.#objectStore;
    const vectorPath = this.#vectorPath;

    const transaction = db.transaction([storeName], "readonly");
    const objectStore = transaction.objectStore(storeName);
    const request = objectStore.openCursor();

    const similarities = new SortedArray(limit, "similarity");

    return new Promise((resolve, reject) => {
      request.onsuccess = (event: any) => {
        const cursor = event.target.result;
        if (cursor) {
          const vectorValue = cursor.value[vectorPath];
          if (vectorValue.length == queryVectorLength) {
            // Only add the vector to the results set if the vector is the same length as query.
            const similarity = cosineSimilarity(queryVector, vectorValue);
            similarities.insert({
              object: cursor.value,
              key: cursor.key,
              similarity,
            });
          }
          cursor.continue();
        } else {
          // sorted already.
          resolve(similarities.slice(0, limit));
        }
      };

      request.onerror = (event: any) => {
        reject(event.target.error);
      };
    });
  }

  get objectStore() {
    // Escape hatch.
    return this.#objectStore;
  }
}

export { VectorDB };
