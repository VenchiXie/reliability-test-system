// function addItem(db, storeName, item) {
//   const transaction = db.transaction([storeName], "readwrite");
//   const objectStore = transaction.objectStore(storeName);
//   const request = objectStore.add(item);

//   request.onsuccess = () => {
//     console.log("Item added to the store:", storeName);
//   };

//   request.onerror = (event) => {
//     console.error("Add item error: ", event.target.errorCode);
//   };
// }

/**
 * @description 用于管理 IndexedDB 数据库的类
 */
class DB {
  /**
   * @description 创建一个数据库管理实例
   * @param {string} databaseName - 数据库名称
   * @param {{ name: string; indexs: { name: string; unique: boolean; }|{ name: string; unique: boolean; }[]| undefined; autoIncrement: boolean; }} [collections]
   * @param {Array|Object} collections - 集合配置，可以是对象或数组
   * @returns {Promise<void>} - 返回一个 Promise 对象
   */
  constructor(databaseName, collections) {
    this.databaseName = databaseName;
    this.collections = collections;
    this.#createDatebase();
  }

  /**
   * @description 创建数据库
   * @returns {Promise<IDBDatabase>} - 返回一个 Promise 对象，用于处理数据库创建结果
   */
  #createDatebase() {
    return new Promise((resolve, reject) => {
      if (!this.databaseName || !this.collections) {
        throw new Error("请添加数据库名称或集合！");
      }

      if (typeof this.databaseName !== "string" || this.databaseName.trim() === "") {
        throw new Error(`"${this.databaseName}" 是非法字符，请使用数字、字符、下划线'_' 进行组合。`);
      }

      const request = indexedDB.open(this.databaseName);

      request.onupgradeneeded = (event) => {
        console.log("eeeeee", event.target.transaction);
        this.#createObjectStores(event.target.result, this.collections);
      };

      request.onsuccess = (event) => {
        // 出现多个集合时，数据库进行升级。
        // Array.isArray(this.collections)
        //   ? this.#checkAndUpgrade(event.target.result, this.collections).then(resolve).catch(reject)
        //   : resolve(event.target.result);

        const db = event.target.result;

        this.#checkAndUpgrade(db, this.collections)
          .then(() => {
            console.log(`Database "${this.databaseName}" initialized successfully`);
          })
          .catch((error) => {
            console.error("Database upgrade error: " + error);
          });
      };

      request.onerror = (event) => {
        reject(event.target.errorCode);
        console.error("Database error: " + event.target.errorCode);
      };
    });
  }

  /**
   * @description 创建集合
   * @param {IDBDatabase} db - 数据库实例
   * @param {Array|Object} collections - 集合配置
   * @returns {Promise<IDBDatabase>} - 返回一个 Promise 对象
   */
  #createObjectStores(db, collections) {
    if (
      !collections ||
      (Array.isArray(collections) && collections.length === 0) ||
      (typeof collections === "object" && Object.keys(collections).length === 0)
    ) {
      throw new Error(`"collections" must be a non-empty object or array.`);
    }

    [].concat(collections).forEach(({ name, indexs, autoIncrement }) => {
      if (typeof name !== "string" || name.trim() === "") {
        throw new Error(
          `"${name}" is an invalid name. Please use a combination of letters, numbers, and underscores (_).`
        );
      }

      // 判断autoIncrement的类型以及值
      if (autoIncrement !== undefined && typeof autoIncrement !== "boolean") {
        throw new Error(`"autoIncrement" must be a boolean.`);
      }

      let objectStore;
      if (!db.objectStoreNames.contains(name)) {

        const transaction = db.transaction([this.collections.name], "readwrite").objectStore(this.collections.name);
        console.log(transaction);

        objectStore = db.createObjectStore(name, { keyPath: "_id", autoIncrement });
        objectStore.createIndex("_id", "_id", { unique: true }); // default create indexs _id
        console.log(`Object store ${name} created in version ${db.version}.`);
      } else {


        objectStore = event.target.transaction.objectStore(name); // access existing object store
        console.log(`Object store ${name} opened for update in version ${db.version}.`);
      }
      this.#createIndexes(objectStore, indexs); // create indexs
    });
  }

  /**
   * @description 创建索引
   * @param {IDBObjectStore} objectStore - 目标对象存储
   * @param {Array|Object} indexs - 索引配置，可以是对象或数组
   *  */
  #createIndexes(objectStore, indexs) {
    if (indexs == null) return;

    const indexArray = Array.isArray(indexs) ? indexs : [indexs];
    // 判断indexs类型以及值
    if (
      indexArray.length === 0 ||
      indexArray.some(
        (index) => typeof index !== "object" || index === null || !("name" in index) || !("unique" in index)
      )
    ) {
      throw new Error("Each index must be a non-null object with 'name' and 'unique' properties");
    }
    indexArray.forEach(({ name, unique }) => {
      // 排除已创建的Index name
      if (!objectStore.indexNames.contains(name)) {
        objectStore.createIndex(name, name, { unique });
        console.log(`Index ${name} created.`);
      }
    });
  }

  /**
   * @description 数据库版本升级
   * @param {IDBDatabase} db - 数据库实例
   * @param {Array|Object} collections - 集合配置
   * @returns {Promise<IDBDatabase>} - 返回一个 Promise 对象
   */
  #checkAndUpgrade(db, collections) {
    return new Promise((resolve, reject) => {
      let isUpgrade = false;

      [].concat(collections).forEach(({ name, indexs }) => {
        // 排除相同的集合名
        if (!db.objectStoreNames.contains(name)) {
          isUpgrade = true;
        } else {
          const objectStore = db.transaction([name], "readonly").objectStore(name);
          if (indexs) {
            const indexArray = Array.isArray(indexs) ? indexs : [indexs];
            indexArray.forEach(({ name }) => {
              if (!objectStore.indexNames.contains(name)) isUpgrade = true;
            });
          }
        }
      });

      if (isUpgrade) {
        db.close();
        const upgradeRequest = indexedDB.open(this.databaseName, db.version + 1);
        upgradeRequest.onupgradeneeded = (event) => {
          this.#createObjectStores(event.target.result, collections);
        };

        upgradeRequest.onsuccess = (event) => {
          resolve(event.target.result);
          console.log("Database upgraded and opened successfully.");
        };

        upgradeRequest.onerror = (event) => {
          reject(event.target.errorCode);
          console.error("Database error: " + event.target.errorCode);
        };
      } else {
        resolve(db);
        console.log("No upgrade needed. Database opened successfully.");
      }
    });
  }
}

const a = async () => {
  try {
    const db1 = new DB("db1", [
      {
        name: "col1",
        indexs: [
          { name: "age", unique: false },
          { name: "name", unique: true },
          { name: "abc", unique: false },
        ],
      },
      {
        name: "col2",
        indexs: [
          { name: "age", unique: false },
          { name: "name", unique: true },
          { name: "abc", unique: false },
        ],
      },
      {
        name: "col3",
      },
      {
        name: "col4",
      },
    ]);
  } catch (error) {
    console.log(error);
  }
};

a();
