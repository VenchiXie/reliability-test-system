// 一个导航item代表一个sheetbook

/**
 * @description 创建数据库
 * @param database 数据库名称
 *  */
export const openDatabase = (database = "") => {
  if (database === "") console.error("error:", "数据库名不能为空!");
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(database);
    request.onupgradeneeded = async (event) => {
      const db = event.target.result;

      const unitsObjectStore = db.createObjectStore("units", { keyPath: "SN" });
      unitsObjectStore.createIndex("serial_number", "serial_number", { unique: true });
      unitsObjectStore.createIndex("build", "build", { unique: false });
      unitsObjectStore.createIndex("waterfall_id", "waterfall_id", { unique: false });
      unitsObjectStore.createIndex("rel_no", "rel_no", { unique: false });
      unitsObjectStore.createIndex("config", "config", { unique: false });
      unitsObjectStore.createIndex("remark", "remark", { unique: false });

      // 单个机台的日志
      const unitsLogObjectStore = db.createObjectStore("logs", { autoIncrement: true });
      unitsLogObjectStore.createIndex("serial_number", "serial_number", { unique: true });
      unitsLogObjectStore.createIndex("build", "build", { unique: false });
      unitsLogObjectStore.createIndex("waterfall_id", "waterfall_id", { unique: false });
      unitsLogObjectStore.createIndex("rel_no", "rel_no", { unique: false });
      unitsLogObjectStore.createIndex("config", "config", { unique: false });
      unitsLogObjectStore.createIndex("remark", "remark", { unique: false });

      resolve(db);
    };
    request.onblocked = () => console.warn("warn:", "在操作数据时，请关闭上个页面或关闭当前页面。");
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

/**
 * @description 获取所有数据库
 *
 *  */
export const getAllDatabases = () => {
  return new Promise(async (resolve, reject) => {
    const databases = await window.indexedDB.databases();
    try {
      resolve(databases);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * @description 升级数据库并创建新的对象存储
 *  */
export const upgradeDatabase = (dbName, newVersion, collectionName) => {
  const request = indexedDB.open(dbName, newVersion);

  request.onupgradeneeded = (event) => {
    const db = event.target.result;

    if (!db.objectStoreNames.contains(collectionName)) {
      db.createObjectStore(collectionName, { keyPath: "id" });
      console.log(`Object store ${collectionName} created in version ${newVersion}.`);
    } else {
      console.log(`Object store ${collectionName} already exists.`);
    }
  };

  request.onsuccess = (event) => {
    console.log("Database upgraded and opened successfully");
  };

  request.onerror = (event) => {
    console.error("Database error: " + event.target.errorCode);
  };
};

/**
 * @description 创建数据库
 * @param {string} dbName 数据名称
 *  */
function createDateBase(dbName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName);

    request.onsuccess = function (event) {
      let db = event.target.result;
      let currentVersion = db.version;
      db.close();
      resolve(db);
    };

    request.onerror = function (event) {
      console.error("Database error: " + event.target.errorCode);
      reject(event.target.errorCode);
    };
  });
}

/**
 * @description 创建集合
 * @param {*} db 数据库实例
 * @param {string} collectionName 集合名称
 * @param {boolean} [isUpgrade=true]  当创建一个集合时，该数据库需要进行升级
 *  */
function createCollection(db, collectionName, isUpgrade = true) {
  return new Promise((resolve, reject) => {
    // 参数验证
    if (!db || typeof collectionName !== "string") return reject(new Error("Invalid arguments"));

    const { name, version } = db;
    const newVersion = !isUpgrade ? version : version + 1;
    const request = indexedDB.open(name, newVersion);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(collectionName)) {
        db.createObjectStore(collectionName, { keyPath: "id", autoIncrement: true });
        console.log(`Object store ${collectionName} created in version ${version}.`);
      } else {
        console.log(`Object store ${collectionName} already exists.`);
      }
    };

    request.onsuccess = (event) => {
      console.log("Database upgraded and opened successfully");
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      console.error("Database error: " + event.target.errorCode);
      reject(event.target.errorCode);
    };
  });
}

/**
 * @description 创建通用唯一识别码
 *  */
function CreatingUniversallyUniqueIdentifier() {
  // 获取当前时间的毫秒数，并转换为16进制字符串，取前8位
  const timeComponent = Date.now().toString(16).slice(-8);

  // 生成一个8位的随机数
  const randomComponent = Math.random().toString(16).substr(2, 8);

  const uuid = "UUID" + timeComponent + randomComponent;
  return uuid;
}

/**
 * @description 用于管理 IndexedDB 数据库的类
 */
class DB {
  /**
   * 创建一个数据库管理实例
   * @param {string} [databaseName] - 数据库名称
   * @param {{ name: string; indexs: { name: string; unique: boolean; }|{ name: string; unique: boolean; }[]| undefined; autoIncrement: boolean; }} [collections]
   * @param {string} [collections.name] - 集合名称（当 collections 是对象时）
   * @param {Object|Array} [collections.indexs] - 索引配置，可以是对象或数组（当 collections 是对象时）
   * @param {string} [collections.indexs.name] - 索引名称（当 indexs 是对象时）
   * @param {boolean} [collections.indexs.unique] - 是否为唯一索引（当 indexs 是对象时）
   * @param {Object|Array} [collections.indexs[].name] - 索引名称（当 indexs 是数组时）
   * @param {boolean} [collections.indexs[].unique] - 是否为唯一索引（当 indexs 是数组时）
   * @param {boolean} [collections.autoIncrement] - 是否自增（当 collections 是对象时）
   * @param {string} [collections[].name] - 集合名称（当 collections 是数组时）
   * @param {Object|Array} [collections[].indexs] - 索引配置，可以是对象或数组（当 collections 是数组时）
   * @param {string} [collections[].indexs.name] - 索引名称（当 indexs 是对象时）
   * @param {boolean} [collections[].indexs.unique] - 是否为唯一索引（当 indexs 是对象时）
   * @param {Object|Array} [collections[].indexs[].name] - 索引名称（当 indexs 是数组时）
   * @param {boolean} [collections[].indexs[].unique] - 是否为唯一索引（当 indexs 是数组时）
   * @param {boolean} [collections[].autoIncrement] - 是否自增（当 collections 是数组时）
   * @returns {Promise<void>} - 返回一个 Promise 对象
   */
  constructor(databaseName, collections) {
    this.databaseName = databaseName;
    this.collections = collections;
    this.#createDatebase();
  }

  #createObjectStores(db, collections) {
    [].concat(collections).forEach(({ name, indexs, autoIncrement }) => {
      if (typeof name !== "string" || name.trim() === "") {
        throw new Error(`"${name}" 是非法字符，请使用数字、字符、下划线'_' 进行组合。`);
      }

      if (typeof autoIncrement !== "undefined") {
        if (typeof autoIncrement !== "boolean") {
          throw new Error(`"autoIncrement" 仅支持Boolean.`);
        }
      }

      if (db.objectStoreNames.contains(name)) {
        throw new Error(`Object store ${name} already exists.`);
      }

      const objectStore = db.createObjectStore(name, { keyPath: "_id", autoIncrement });
      objectStore.createIndex("_id", "_id", { unique: true }); // default create indexs _id
      this.#createIndexes(objectStore, indexs); // create indexs
      console.log(`Object store ${name} created in version ${db.version}.`);
    });
  }

  #createIndexes(objectStore, indexs) {
    // if (!indexes) return;
    if (typeof indexs !== "undefined") {
      if (Object.keys(indexs).length === 0 || indexs.length === 0) {
        throw new Error(`"indexs",非法写法!`);
      }
      [].concat(indexs).forEach(({ name, unique }) => objectStore.createIndex(name, name, { unique }));
    }
  }

  /**
   * 创建数据库及集合
   * @returns {Promise<IDBDatabase>} - 返回一个 Promise 对象，用于处理数据库创建结果
   */
  async #createDatebase() {
    const db = await new Promise((resolve, reject) => {
      if (typeof this.databaseName === "undefined" || typeof this.collections === "undefined") {
        throw new Error(`请添加数据库名称或集合！`);
      }

      if (typeof this.databaseName !== "string" || this.databaseName.trim() === "") {
        throw new Error(`"${this.databaseName}" 是非法字符，请使用数字、字符、下划线'_' 进行组合。`);
      }

      if (Object.keys(this.collections).length === 0 || this.collections.length === 0) {
        throw new Error(`"collections",非法写法!`);
      }

      [].concat(this.collections).forEach(({ name, indexs }) => {
        if (typeof name !== "string" || name.trim() === "") {
          throw new Error(`"${name}" 是非法字符，请使用数字、字符、下划线'_' 进行组合。`);
        }

        if (typeof indexs !== "undefined") {
          if (Object.keys(indexs).length === 0 || indexs.length === 0) {
            throw new Error(`"indexs",非法写法!`);
          }
        }
      });

      const request = indexedDB.open(this.databaseName);

      request.onupgradeneeded = (event) => {
        this.#createObjectStores(event.target.result, this.collections);
      };

      request.onsuccess = (event) => {
        // 出现多个集合时，数据库进行升级。
        Array.isArray(this.collections)
          ? this.#checkAndUpgrade(event.target.result, this.collections)
          : resolve(event.target.result);
        console.log(`Database "${this.databaseName}" created successfully`);
      };

      request.onerror = (event) => {
        reject(event.target.errorCode);
        console.error("Database error: " + event.target.errorCode);
      };
    });

    return db;
  }

  async #checkAndUpgrade(db, collections) {
    let isUpgrade = false;

    // 禁止出现相同的集合名
    [].concat(collections).forEach(({ name }) => {
      if (!db.objectStoreNames.contains(name)) isUpgrade = false;
    });

    if (isUpgrade) {
      db.close();
      const upgradedDB = await new Promise((resolve, reject) => {
        const upgradeRequest = indexedDB.open(this.databaseName, db.version + 1);

        upgradeRequest.onupgradeneeded = (event) => {
          const upgradedDB = event.target.result;
          this.#createObjectStores(upgradedDB, collections);
          resolve(upgradedDB);
        };

        upgradeRequest.onsuccess = (event) => {
          resolve(event.target.result);
          console.log("Database upgraded and opened successfully");
        };

        upgradeRequest.onerror = (event) => {
          reject(event.target.errorCode);
          console.error("Database error: " + event.target.errorCode);
        };
      });
      return upgradedDB;
    } else {
      console.log("No upgrade needed. Database opened successfully");
      return db;
    }
  }
}

const a = async () => {
  const db = new DB("db1", { name: "col2", indexs: { name: "name", unique: true } });
};

a();
