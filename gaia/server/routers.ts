import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required');
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Characters
  characters: router({
    list: publicProcedure.query(() => db.getAllCharacters()),
    get: publicProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getCharacterById(input.id)),
    create: adminProcedure.input(z.object({
      name: z.string(),
      alias: z.string().optional(),
      archetype: z.string().optional(),
      role: z.string().optional(),
      description: z.string().optional(),
      psychology: z.string().optional(),
      conflicts: z.string().optional(),
      references: z.string().optional(),
      imageUrl: z.string().optional(),
    })).mutation(({ input }) => db.createCharacter(input)),
    update: adminProcedure.input(z.object({
      id: z.number(),
      name: z.string().optional(),
      alias: z.string().optional(),
      archetype: z.string().optional(),
      role: z.string().optional(),
      description: z.string().optional(),
      psychology: z.string().optional(),
      conflicts: z.string().optional(),
      references: z.string().optional(),
      imageUrl: z.string().optional(),
    })).mutation(({ input }) => {
      const { id, ...data } = input;
      return db.updateCharacter(id, data);
    }),
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.deleteCharacter(input.id)),
  }),

  // Factions
  factions: router({
    list: publicProcedure.query(() => db.getAllFactions()),
    get: publicProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getFactionById(input.id)),
    create: adminProcedure.input(z.object({
      name: z.string(),
      type: z.enum(["government", "military", "organization", "other"]).optional(),
      motto: z.string().optional(),
      description: z.string().optional(),
      politics: z.string().optional(),
      territory: z.string().optional(),
      imageUrl: z.string().optional(),
    })).mutation(({ input }) => db.createFaction(input)),
    update: adminProcedure.input(z.object({
      id: z.number(),
      name: z.string().optional(),
      type: z.enum(["government", "military", "organization", "other"]).optional(),
      motto: z.string().optional(),
      description: z.string().optional(),
      politics: z.string().optional(),
      territory: z.string().optional(),
      imageUrl: z.string().optional(),
    })).mutation(({ input }) => {
      const { id, ...data } = input;
      return db.updateFaction(id, data);
    }),
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.deleteFaction(input.id)),
  }),

  // Locations
  locations: router({
    list: publicProcedure.query(() => db.getAllLocations()),
    get: publicProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getLocationById(input.id)),
    create: adminProcedure.input(z.object({
      name: z.string(),
      type: z.enum(["planet", "region", "city", "structure", "other"]).optional(),
      description: z.string().optional(),
      characteristics: z.string().optional(),
      inhabitants: z.string().optional(),
      significance: z.string().optional(),
      imageUrl: z.string().optional(),
    })).mutation(({ input }) => db.createLocation(input)),
    update: adminProcedure.input(z.object({
      id: z.number(),
      name: z.string().optional(),
      type: z.enum(["planet", "region", "city", "structure", "other"]).optional(),
      description: z.string().optional(),
      characteristics: z.string().optional(),
      inhabitants: z.string().optional(),
      significance: z.string().optional(),
      imageUrl: z.string().optional(),
    })).mutation(({ input }) => {
      const { id, ...data } = input;
      return db.updateLocation(id, data);
    }),
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.deleteLocation(input.id)),
  }),

  // Events (Timeline)
  events: router({
    list: publicProcedure.query(() => db.getAllEvents()),
    get: publicProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getEventById(input.id)),
    create: adminProcedure.input(z.object({
      year: z.number(),
      title: z.string(),
      description: z.string().optional(),
      category: z.enum(["origin", "discovery", "tragedy", "conflict", "expansion"]).optional(),
      relatedCharacterId: z.number().optional(),
      relatedLocationId: z.number().optional(),
    })).mutation(({ input }) => db.createEvent(input)),
    update: adminProcedure.input(z.object({
      id: z.number(),
      year: z.number().optional(),
      title: z.string().optional(),
      description: z.string().optional(),
      category: z.enum(["origin", "discovery", "tragedy", "conflict", "expansion"]).optional(),
      relatedCharacterId: z.number().optional(),
      relatedLocationId: z.number().optional(),
    })).mutation(({ input }) => {
      const { id, ...data } = input;
      return db.updateEvent(id, data);
    }),
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.deleteEvent(input.id)),
  }),

  // Concepts
  concepts: router({
    list: publicProcedure.query(() => db.getAllConcepts()),
    get: publicProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getConceptById(input.id)),
    create: adminProcedure.input(z.object({
      name: z.string(),
      category: z.enum(["energy", "technology", "entity", "philosophy", "other"]).optional(),
      shortDescription: z.string().optional(),
      fullDescription: z.string().optional(),
      properties: z.string().optional(),
      manifestations: z.string().optional(),
      imageUrl: z.string().optional(),
    })).mutation(({ input }) => db.createConcept(input)),
    update: adminProcedure.input(z.object({
      id: z.number(),
      name: z.string().optional(),
      category: z.enum(["energy", "technology", "entity", "philosophy", "other"]).optional(),
      shortDescription: z.string().optional(),
      fullDescription: z.string().optional(),
      properties: z.string().optional(),
      manifestations: z.string().optional(),
      imageUrl: z.string().optional(),
    })).mutation(({ input }) => {
      const { id, ...data } = input;
      return db.updateConcept(id, data);
    }),
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.deleteConcept(input.id)),
  }),

  // Glitches (Narrative conflicts)
  glitches: router({
    list: publicProcedure.query(() => db.getAllGlitches()),
    unresolved: publicProcedure.query(() => db.getUnresolvedGlitches()),
    get: publicProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getGlitchById(input.id)),
    create: adminProcedure.input(z.object({
      title: z.string(),
      severity: z.enum(["critical", "major", "minor"]).optional(),
      description: z.string().optional(),
      versionA: z.string().optional(),
      versionB: z.string().optional(),
    })).mutation(({ input }) => db.createGlitch(input)),
    resolve: adminProcedure.input(z.object({
      id: z.number(),
      resolution: z.string(),
    })).mutation(({ input, ctx }) => db.resolveGlitch(input.id, input.resolution, ctx.user.id)),
    update: adminProcedure.input(z.object({
      id: z.number(),
      title: z.string().optional(),
      severity: z.enum(["critical", "major", "minor"]).optional(),
      description: z.string().optional(),
      versionA: z.string().optional(),
      versionB: z.string().optional(),
    })).mutation(({ input }) => {
      const { id, ...data } = input;
      return db.updateGlitch(id, data);
    }),
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.deleteGlitch(input.id)),
  }),

  // Search
  search: router({
    all: publicProcedure.input(z.object({ query: z.string() })).query(({ input }) => db.searchAll(input.query)),
  }),
});

export type AppRouter = typeof appRouter;
