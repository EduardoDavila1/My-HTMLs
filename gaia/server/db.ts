import { eq, like, or, desc, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  characters, InsertCharacter, Character,
  factions, InsertFaction, Faction,
  locations, InsertLocation, Location,
  events, InsertEvent, Event,
  concepts, InsertConcept, Concept,
  glitches, InsertGlitch, Glitch
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ========== USER HELPERS ==========
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ========== CHARACTER HELPERS ==========
export async function getAllCharacters(): Promise<Character[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(characters).orderBy(asc(characters.name));
}

export async function getCharacterById(id: number): Promise<Character | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(characters).where(eq(characters.id, id)).limit(1);
  return result[0];
}

export async function createCharacter(data: InsertCharacter): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(characters).values(data);
}

export async function updateCharacter(id: number, data: Partial<InsertCharacter>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(characters).set(data).where(eq(characters.id, id));
}

export async function deleteCharacter(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(characters).where(eq(characters.id, id));
}

// ========== FACTION HELPERS ==========
export async function getAllFactions(): Promise<Faction[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(factions).orderBy(asc(factions.name));
}

export async function getFactionById(id: number): Promise<Faction | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(factions).where(eq(factions.id, id)).limit(1);
  return result[0];
}

export async function createFaction(data: InsertFaction): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(factions).values(data);
}

export async function updateFaction(id: number, data: Partial<InsertFaction>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(factions).set(data).where(eq(factions.id, id));
}

export async function deleteFaction(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(factions).where(eq(factions.id, id));
}

// ========== LOCATION HELPERS ==========
export async function getAllLocations(): Promise<Location[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(locations).orderBy(asc(locations.name));
}

export async function getLocationById(id: number): Promise<Location | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(locations).where(eq(locations.id, id)).limit(1);
  return result[0];
}

export async function createLocation(data: InsertLocation): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(locations).values(data);
}

export async function updateLocation(id: number, data: Partial<InsertLocation>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(locations).set(data).where(eq(locations.id, id));
}

export async function deleteLocation(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(locations).where(eq(locations.id, id));
}

// ========== EVENT HELPERS ==========
export async function getAllEvents(): Promise<Event[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(events).orderBy(asc(events.year));
}

export async function getEventById(id: number): Promise<Event | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(events).where(eq(events.id, id)).limit(1);
  return result[0];
}

export async function createEvent(data: InsertEvent): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(events).values(data);
}

export async function updateEvent(id: number, data: Partial<InsertEvent>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(events).set(data).where(eq(events.id, id));
}

export async function deleteEvent(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(events).where(eq(events.id, id));
}

// ========== CONCEPT HELPERS ==========
export async function getAllConcepts(): Promise<Concept[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(concepts).orderBy(asc(concepts.name));
}

export async function getConceptById(id: number): Promise<Concept | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(concepts).where(eq(concepts.id, id)).limit(1);
  return result[0];
}

export async function createConcept(data: InsertConcept): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(concepts).values(data);
}

export async function updateConcept(id: number, data: Partial<InsertConcept>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(concepts).set(data).where(eq(concepts.id, id));
}

export async function deleteConcept(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(concepts).where(eq(concepts.id, id));
}

// ========== GLITCH HELPERS ==========
export async function getAllGlitches(): Promise<Glitch[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(glitches).orderBy(desc(glitches.createdAt));
}

export async function getUnresolvedGlitches(): Promise<Glitch[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(glitches).where(eq(glitches.resolved, false)).orderBy(desc(glitches.createdAt));
}

export async function getGlitchById(id: number): Promise<Glitch | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(glitches).where(eq(glitches.id, id)).limit(1);
  return result[0];
}

export async function createGlitch(data: InsertGlitch): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(glitches).values(data);
}

export async function updateGlitch(id: number, data: Partial<InsertGlitch>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(glitches).set(data).where(eq(glitches.id, id));
}

export async function resolveGlitch(id: number, resolution: string, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(glitches).set({
    resolved: true,
    resolution,
    resolvedAt: new Date(),
    resolvedBy: userId
  }).where(eq(glitches.id, id));
}

export async function deleteGlitch(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(glitches).where(eq(glitches.id, id));
}

// ========== SEARCH HELPER ==========
export async function searchAll(query: string) {
  const db = await getDb();
  if (!db) return { characters: [], factions: [], locations: [], events: [], concepts: [] };
  
  const searchTerm = `%${query}%`;
  
  const [charResults, factionResults, locationResults, eventResults, conceptResults] = await Promise.all([
    db.select().from(characters).where(
      or(like(characters.name, searchTerm), like(characters.description, searchTerm))
    ),
    db.select().from(factions).where(
      or(like(factions.name, searchTerm), like(factions.description, searchTerm))
    ),
    db.select().from(locations).where(
      or(like(locations.name, searchTerm), like(locations.description, searchTerm))
    ),
    db.select().from(events).where(
      or(like(events.title, searchTerm), like(events.description, searchTerm))
    ),
    db.select().from(concepts).where(
      or(like(concepts.name, searchTerm), like(concepts.shortDescription, searchTerm))
    )
  ]);
  
  return {
    characters: charResults,
    factions: factionResults,
    locations: locationResults,
    events: eventResults,
    concepts: conceptResults
  };
}
