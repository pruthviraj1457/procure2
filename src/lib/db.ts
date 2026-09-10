import fs from "fs";
import path from "path";

// File-backed persistent database fallback
const DB_FILE = path.join(process.cwd(), "prisma", "dev.json");

type DbStore = {
  officers: any[];
  procurementRequirements: any[];
  suppliers: any[];
  conversations: any[];
  messages: any[];
  quotes: any[];
  procurementReports: any[];
  favoriteSuppliers: any[];
};

function loadStore(): DbStore {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn("[FileDB] Warning reading dev.json:", err);
  }
  return {
    officers: [],
    procurementRequirements: [],
    suppliers: [],
    conversations: [],
    messages: [],
    quotes: [],
    procurementReports: [],
    favoriteSuppliers: [],
  };
}

function saveStore(store: DbStore) {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.error("[FileDB] Error writing dev.json:", err);
  }
}

function generateId(prefix: string = "cl"): string {
  return prefix + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

function matchesWhere(item: any, where?: Record<string, any>): boolean {
  if (!where) return true;
  for (const [key, val] of Object.entries(where)) {
    if (val === undefined) continue;
    if (item[key] !== val) return false;
  }
  return true;
}

function createModelHandler(collectionKey: keyof DbStore, idPrefix: string = "id") {
  return {
    async findFirst(args?: { where?: Record<string, any> }) {
      const store = loadStore();
      const list = store[collectionKey] || [];
      return list.find((item) => matchesWhere(item, args?.where)) || null;
    },

    async findUnique(args: { where: Record<string, any> }) {
      const store = loadStore();
      const list = store[collectionKey] || [];
      return list.find((item) => matchesWhere(item, args.where)) || null;
    },

    async findMany(args?: { where?: Record<string, any>; orderBy?: any; include?: any }) {
      const store = loadStore();
      let list = store[collectionKey] || [];
      if (args?.where) {
        list = list.filter((item) => matchesWhere(item, args.where));
      }
      if (args?.orderBy) {
        const orderKey = Object.keys(args.orderBy)[0];
        const dir = args.orderBy[orderKey];
        list = [...list].sort((a, b) => {
          const valA = a[orderKey];
          const valB = b[orderKey];
          if (valA < valB) return dir === "desc" ? 1 : -1;
          if (valA > valB) return dir === "desc" ? -1 : 1;
          return 0;
        });
      }
      return list;
    },

    async create(args: { data: Record<string, any>; include?: any }) {
      const store = loadStore();
      const list = store[collectionKey] || [];

      const newItem = {
        id: args.data.id || generateId(idPrefix),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        extractedJson: "{}",
        matchedStandardIds: "[]",
        inputMode: "text",
        status: "draft",
        ...args.data,
      };

      list.push(newItem);
      store[collectionKey] = list;
      saveStore(store);

      return newItem;
    },

    async update(args: { where: Record<string, any>; data: Record<string, any> }) {
      const store = loadStore();
      const list = store[collectionKey] || [];
      const index = list.findIndex((item) => matchesWhere(item, args.where));
      if (index === -1) throw new Error(`Record not found in ${collectionKey}`);

      const updatedItem = {
        ...list[index],
        ...args.data,
        updatedAt: new Date().toISOString(),
      };

      list[index] = updatedItem;
      store[collectionKey] = list;
      saveStore(store);

      return updatedItem;
    },

    async upsert(args: { where: Record<string, any>; update: Record<string, any>; create: Record<string, any> }) {
      const store = loadStore();
      const list = store[collectionKey] || [];
      const existingIndex = list.findIndex((item) => matchesWhere(item, args.where));

      if (existingIndex !== -1) {
        const updatedItem = {
          ...list[existingIndex],
          ...args.update,
          updatedAt: new Date().toISOString(),
        };
        list[existingIndex] = updatedItem;
        store[collectionKey] = list;
        saveStore(store);
        return updatedItem;
      } else {
        const newItem = {
          id: args.create.id || generateId(idPrefix),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...args.create,
        };
        list.push(newItem);
        store[collectionKey] = list;
        saveStore(store);
        return newItem;
      }
    },

    async delete(args: { where: Record<string, any> }) {
      const store = loadStore();
      const list = store[collectionKey] || [];
      const index = list.findIndex((item) => matchesWhere(item, args.where));
      if (index === -1) throw new Error(`Record not found in ${collectionKey}`);

      const deletedItem = list[index];
      store[collectionKey] = list.filter((_, i) => i !== index);
      saveStore(store);

      return deletedItem;
    },
  };
}

let prismaInstance: any = null;

try {
  const { PrismaClient } = require("@prisma/client");
  const globalForPrisma = globalThis as unknown as { prisma: any };
  prismaInstance = globalForPrisma.prisma || new PrismaClient();
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prismaInstance;
} catch {
  // Use file-backed persistent store fallback
  prismaInstance = {
    officer: createModelHandler("officers", "off"),
    procurementRequirement: createModelHandler("procurementRequirements", "req"),
    supplier: createModelHandler("suppliers", "sup"),
    conversation: createModelHandler("conversations", "conv"),
    message: createModelHandler("messages", "msg"),
    quote: createModelHandler("quotes", "quo"),
    procurementReport: createModelHandler("procurementReports", "rep"),
    favoriteSupplier: createModelHandler("favoriteSuppliers", "fav"),
  };
}

export const prisma = prismaInstance;
