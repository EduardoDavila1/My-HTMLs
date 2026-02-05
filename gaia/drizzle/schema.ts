import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

// Core user table backing auth flow
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Personajes del universo GAIA
export const characters = mysqlTable("characters", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  alias: varchar("alias", { length: 128 }),
  archetype: varchar("archetype", { length: 64 }), // MBTI type
  role: varchar("role", { length: 128 }), // e.g., "Creador", "Héroe Empático"
  description: text("description"),
  psychology: text("psychology"),
  conflicts: text("conflicts"),
  references: text("references"), // Personajes de referencia (Sherlock, Tony Stark, etc.)
  imageUrl: varchar("imageUrl", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Character = typeof characters.$inferSelect;
export type InsertCharacter = typeof characters.$inferInsert;

// Facciones y organizaciones
export const factions = mysqlTable("factions", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  type: mysqlEnum("type", ["government", "military", "organization", "other"]).default("other"),
  motto: varchar("motto", { length: 256 }),
  description: text("description"),
  politics: text("politics"), // Sistema político, ideología
  territory: varchar("territory", { length: 256 }),
  imageUrl: varchar("imageUrl", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Faction = typeof factions.$inferSelect;
export type InsertFaction = typeof factions.$inferInsert;

// Ubicaciones y planetas
export const locations = mysqlTable("locations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  type: mysqlEnum("type", ["planet", "region", "city", "structure", "other"]).default("planet"),
  description: text("description"),
  characteristics: text("characteristics"), // Características físicas, ambiente
  inhabitants: text("inhabitants"),
  significance: text("significance"), // Importancia narrativa
  imageUrl: varchar("imageUrl", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Location = typeof locations.$inferSelect;
export type InsertLocation = typeof locations.$inferInsert;

// Eventos de la cronología
export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  year: int("year").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", ["origin", "discovery", "tragedy", "conflict", "expansion"]).default("origin"),
  relatedCharacterId: int("relatedCharacterId"),
  relatedLocationId: int("relatedLocationId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

// Conceptos fundamentales (Chaitz, G.A.I.A., tecnologías)
export const concepts = mysqlTable("concepts", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  category: mysqlEnum("category", ["energy", "technology", "entity", "philosophy", "other"]).default("other"),
  shortDescription: varchar("shortDescription", { length: 512 }),
  fullDescription: text("fullDescription"),
  properties: text("properties"), // Propiedades, características
  manifestations: text("manifestations"), // Cómo se manifiesta
  imageUrl: varchar("imageUrl", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Concept = typeof concepts.$inferSelect;
export type InsertConcept = typeof concepts.$inferInsert;

// Glitches narrativos (conflictos detectados en el lore)
export const glitches = mysqlTable("glitches", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  severity: mysqlEnum("severity", ["critical", "major", "minor"]).default("major"),
  description: text("description"),
  versionA: text("versionA"), // Primera versión del conflicto
  versionB: text("versionB"), // Segunda versión del conflicto
  resolution: text("resolution"), // Resolución propuesta/aplicada
  resolved: boolean("resolved").default(false),
  resolvedAt: timestamp("resolvedAt"),
  resolvedBy: int("resolvedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Glitch = typeof glitches.$inferSelect;
export type InsertGlitch = typeof glitches.$inferInsert;
