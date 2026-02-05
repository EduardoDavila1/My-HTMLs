import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database module
vi.mock("./db", () => ({
  getAllCharacters: vi.fn().mockResolvedValue([
    { id: 1, name: "Doctor Eustaquio", archetype: "INTJ", role: "Creador" },
    { id: 2, name: "G.A.I.A.", archetype: "INFJ", role: "Protagonista" },
  ]),
  getAllFactions: vi.fn().mockResolvedValue([
    { id: 1, name: "Confederación Draco", type: "government" },
    { id: 2, name: "Tempest Nacht", type: "military" },
  ]),
  getAllLocations: vi.fn().mockResolvedValue([
    { id: 1, name: "Ten'tsool", type: "planet" },
    { id: 2, name: "Avitia", type: "planet" },
  ]),
  getAllEvents: vi.fn().mockResolvedValue([
    { id: 1, year: 1960, title: "Nacimiento del Doctor", category: "origin" },
    { id: 2, year: 1990, title: "Gaia desarrolla consciencia", category: "origin" },
  ]),
  getAllConcepts: vi.fn().mockResolvedValue([
    { id: 1, name: "Chaitz", category: "energy" },
    { id: 2, name: "G.A.I.A. (Sistema)", category: "technology" },
  ]),
  getAllGlitches: vi.fn().mockResolvedValue([
    { id: 1, title: "Conflicto de origen", severity: "critical", resolved: false },
  ]),
  getUnresolvedGlitches: vi.fn().mockResolvedValue([
    { id: 1, title: "Conflicto de origen", severity: "critical", resolved: false },
  ]),
  searchAll: vi.fn().mockResolvedValue({
    characters: [{ id: 1, name: "Doctor Eustaquio" }],
    factions: [],
    locations: [],
    events: [],
    concepts: [],
  }),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("Lore API - Characters", () => {
  it("returns list of characters", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const characters = await caller.characters.list();
    
    expect(characters).toHaveLength(2);
    expect(characters[0].name).toBe("Doctor Eustaquio");
    expect(characters[1].name).toBe("G.A.I.A.");
  });
});

describe("Lore API - Factions", () => {
  it("returns list of factions", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const factions = await caller.factions.list();
    
    expect(factions).toHaveLength(2);
    expect(factions[0].name).toBe("Confederación Draco");
    expect(factions[1].type).toBe("military");
  });
});

describe("Lore API - Locations", () => {
  it("returns list of locations", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const locations = await caller.locations.list();
    
    expect(locations).toHaveLength(2);
    expect(locations[0].name).toBe("Ten'tsool");
  });
});

describe("Lore API - Events", () => {
  it("returns list of events ordered by year", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const events = await caller.events.list();
    
    expect(events).toHaveLength(2);
    expect(events[0].year).toBe(1960);
    expect(events[1].year).toBe(1990);
  });
});

describe("Lore API - Concepts", () => {
  it("returns list of concepts", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const concepts = await caller.concepts.list();
    
    expect(concepts).toHaveLength(2);
    expect(concepts[0].name).toBe("Chaitz");
  });
});

describe("Lore API - Glitches", () => {
  it("returns list of all glitches", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const glitches = await caller.glitches.list();
    
    expect(glitches).toHaveLength(1);
    expect(glitches[0].severity).toBe("critical");
  });

  it("returns only unresolved glitches", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const unresolved = await caller.glitches.unresolved();
    
    expect(unresolved).toHaveLength(1);
    expect(unresolved[0].resolved).toBe(false);
  });
});

describe("Lore API - Search", () => {
  it("searches across all entities", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const results = await caller.search.all({ query: "Doctor" });
    
    expect(results.characters).toHaveLength(1);
    expect(results.characters[0].name).toBe("Doctor Eustaquio");
  });
});
