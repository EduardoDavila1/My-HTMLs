// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/db.ts
import { eq, like, or, desc, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";

// drizzle/schema.ts
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var characters = mysqlTable("characters", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  alias: varchar("alias", { length: 128 }),
  archetype: varchar("archetype", { length: 64 }),
  // MBTI type
  role: varchar("role", { length: 128 }),
  // e.g., "Creador", "Héroe Empático"
  description: text("description"),
  psychology: text("psychology"),
  conflicts: text("conflicts"),
  references: text("references"),
  // Personajes de referencia (Sherlock, Tony Stark, etc.)
  imageUrl: varchar("imageUrl", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var factions = mysqlTable("factions", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  type: mysqlEnum("type", ["government", "military", "organization", "other"]).default("other"),
  motto: varchar("motto", { length: 256 }),
  description: text("description"),
  politics: text("politics"),
  // Sistema político, ideología
  territory: varchar("territory", { length: 256 }),
  imageUrl: varchar("imageUrl", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var locations = mysqlTable("locations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  type: mysqlEnum("type", ["planet", "region", "city", "structure", "other"]).default("planet"),
  description: text("description"),
  characteristics: text("characteristics"),
  // Características físicas, ambiente
  inhabitants: text("inhabitants"),
  significance: text("significance"),
  // Importancia narrativa
  imageUrl: varchar("imageUrl", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  year: int("year").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", ["origin", "discovery", "tragedy", "conflict", "expansion"]).default("origin"),
  relatedCharacterId: int("relatedCharacterId"),
  relatedLocationId: int("relatedLocationId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var concepts = mysqlTable("concepts", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  category: mysqlEnum("category", ["energy", "technology", "entity", "philosophy", "other"]).default("other"),
  shortDescription: varchar("shortDescription", { length: 512 }),
  fullDescription: text("fullDescription"),
  properties: text("properties"),
  // Propiedades, características
  manifestations: text("manifestations"),
  // Cómo se manifiesta
  imageUrl: varchar("imageUrl", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var glitches = mysqlTable("glitches", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  severity: mysqlEnum("severity", ["critical", "major", "minor"]).default("major"),
  description: text("description"),
  versionA: text("versionA"),
  // Primera versión del conflicto
  versionB: text("versionB"),
  // Segunda versión del conflicto
  resolution: text("resolution"),
  // Resolución propuesta/aplicada
  resolved: boolean("resolved").default(false),
  resolvedAt: timestamp("resolvedAt"),
  resolvedBy: int("resolvedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
};

// server/db.ts
var _db = null;
async function getDb() {
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
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = { openId: user.openId };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getAllCharacters() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(characters).orderBy(asc(characters.name));
}
async function getCharacterById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(characters).where(eq(characters.id, id)).limit(1);
  return result[0];
}
async function createCharacter(data) {
  const db = await getDb();
  if (!db) return;
  await db.insert(characters).values(data);
}
async function updateCharacter(id, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(characters).set(data).where(eq(characters.id, id));
}
async function deleteCharacter(id) {
  const db = await getDb();
  if (!db) return;
  await db.delete(characters).where(eq(characters.id, id));
}
async function getAllFactions() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(factions).orderBy(asc(factions.name));
}
async function getFactionById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(factions).where(eq(factions.id, id)).limit(1);
  return result[0];
}
async function createFaction(data) {
  const db = await getDb();
  if (!db) return;
  await db.insert(factions).values(data);
}
async function updateFaction(id, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(factions).set(data).where(eq(factions.id, id));
}
async function deleteFaction(id) {
  const db = await getDb();
  if (!db) return;
  await db.delete(factions).where(eq(factions.id, id));
}
async function getAllLocations() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(locations).orderBy(asc(locations.name));
}
async function getLocationById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(locations).where(eq(locations.id, id)).limit(1);
  return result[0];
}
async function createLocation(data) {
  const db = await getDb();
  if (!db) return;
  await db.insert(locations).values(data);
}
async function updateLocation(id, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(locations).set(data).where(eq(locations.id, id));
}
async function deleteLocation(id) {
  const db = await getDb();
  if (!db) return;
  await db.delete(locations).where(eq(locations.id, id));
}
async function getAllEvents() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(events).orderBy(asc(events.year));
}
async function getEventById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(events).where(eq(events.id, id)).limit(1);
  return result[0];
}
async function createEvent(data) {
  const db = await getDb();
  if (!db) return;
  await db.insert(events).values(data);
}
async function updateEvent(id, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(events).set(data).where(eq(events.id, id));
}
async function deleteEvent(id) {
  const db = await getDb();
  if (!db) return;
  await db.delete(events).where(eq(events.id, id));
}
async function getAllConcepts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(concepts).orderBy(asc(concepts.name));
}
async function getConceptById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(concepts).where(eq(concepts.id, id)).limit(1);
  return result[0];
}
async function createConcept(data) {
  const db = await getDb();
  if (!db) return;
  await db.insert(concepts).values(data);
}
async function updateConcept(id, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(concepts).set(data).where(eq(concepts.id, id));
}
async function deleteConcept(id) {
  const db = await getDb();
  if (!db) return;
  await db.delete(concepts).where(eq(concepts.id, id));
}
async function getAllGlitches() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(glitches).orderBy(desc(glitches.createdAt));
}
async function getUnresolvedGlitches() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(glitches).where(eq(glitches.resolved, false)).orderBy(desc(glitches.createdAt));
}
async function getGlitchById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(glitches).where(eq(glitches.id, id)).limit(1);
  return result[0];
}
async function createGlitch(data) {
  const db = await getDb();
  if (!db) return;
  await db.insert(glitches).values(data);
}
async function updateGlitch(id, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(glitches).set(data).where(eq(glitches.id, id));
}
async function resolveGlitch(id, resolution, userId) {
  const db = await getDb();
  if (!db) return;
  await db.update(glitches).set({
    resolved: true,
    resolution,
    resolvedAt: /* @__PURE__ */ new Date(),
    resolvedBy: userId
  }).where(eq(glitches.id, id));
}
async function deleteGlitch(id) {
  const db = await getDb();
  if (!db) return;
  await db.delete(glitches).where(eq(glitches.id, id));
}
async function searchAll(query) {
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

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/routers.ts
import { z as z2 } from "zod";

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers.ts
var adminProcedure2 = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }
  return next({ ctx });
});
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    })
  }),
  // Characters
  characters: router({
    list: publicProcedure.query(() => getAllCharacters()),
    get: publicProcedure.input(z2.object({ id: z2.number() })).query(({ input }) => getCharacterById(input.id)),
    create: adminProcedure2.input(z2.object({
      name: z2.string(),
      alias: z2.string().optional(),
      archetype: z2.string().optional(),
      role: z2.string().optional(),
      description: z2.string().optional(),
      psychology: z2.string().optional(),
      conflicts: z2.string().optional(),
      references: z2.string().optional(),
      imageUrl: z2.string().optional()
    })).mutation(({ input }) => createCharacter(input)),
    update: adminProcedure2.input(z2.object({
      id: z2.number(),
      name: z2.string().optional(),
      alias: z2.string().optional(),
      archetype: z2.string().optional(),
      role: z2.string().optional(),
      description: z2.string().optional(),
      psychology: z2.string().optional(),
      conflicts: z2.string().optional(),
      references: z2.string().optional(),
      imageUrl: z2.string().optional()
    })).mutation(({ input }) => {
      const { id, ...data } = input;
      return updateCharacter(id, data);
    }),
    delete: adminProcedure2.input(z2.object({ id: z2.number() })).mutation(({ input }) => deleteCharacter(input.id))
  }),
  // Factions
  factions: router({
    list: publicProcedure.query(() => getAllFactions()),
    get: publicProcedure.input(z2.object({ id: z2.number() })).query(({ input }) => getFactionById(input.id)),
    create: adminProcedure2.input(z2.object({
      name: z2.string(),
      type: z2.enum(["government", "military", "organization", "other"]).optional(),
      motto: z2.string().optional(),
      description: z2.string().optional(),
      politics: z2.string().optional(),
      territory: z2.string().optional(),
      imageUrl: z2.string().optional()
    })).mutation(({ input }) => createFaction(input)),
    update: adminProcedure2.input(z2.object({
      id: z2.number(),
      name: z2.string().optional(),
      type: z2.enum(["government", "military", "organization", "other"]).optional(),
      motto: z2.string().optional(),
      description: z2.string().optional(),
      politics: z2.string().optional(),
      territory: z2.string().optional(),
      imageUrl: z2.string().optional()
    })).mutation(({ input }) => {
      const { id, ...data } = input;
      return updateFaction(id, data);
    }),
    delete: adminProcedure2.input(z2.object({ id: z2.number() })).mutation(({ input }) => deleteFaction(input.id))
  }),
  // Locations
  locations: router({
    list: publicProcedure.query(() => getAllLocations()),
    get: publicProcedure.input(z2.object({ id: z2.number() })).query(({ input }) => getLocationById(input.id)),
    create: adminProcedure2.input(z2.object({
      name: z2.string(),
      type: z2.enum(["planet", "region", "city", "structure", "other"]).optional(),
      description: z2.string().optional(),
      characteristics: z2.string().optional(),
      inhabitants: z2.string().optional(),
      significance: z2.string().optional(),
      imageUrl: z2.string().optional()
    })).mutation(({ input }) => createLocation(input)),
    update: adminProcedure2.input(z2.object({
      id: z2.number(),
      name: z2.string().optional(),
      type: z2.enum(["planet", "region", "city", "structure", "other"]).optional(),
      description: z2.string().optional(),
      characteristics: z2.string().optional(),
      inhabitants: z2.string().optional(),
      significance: z2.string().optional(),
      imageUrl: z2.string().optional()
    })).mutation(({ input }) => {
      const { id, ...data } = input;
      return updateLocation(id, data);
    }),
    delete: adminProcedure2.input(z2.object({ id: z2.number() })).mutation(({ input }) => deleteLocation(input.id))
  }),
  // Events (Timeline)
  events: router({
    list: publicProcedure.query(() => getAllEvents()),
    get: publicProcedure.input(z2.object({ id: z2.number() })).query(({ input }) => getEventById(input.id)),
    create: adminProcedure2.input(z2.object({
      year: z2.number(),
      title: z2.string(),
      description: z2.string().optional(),
      category: z2.enum(["origin", "discovery", "tragedy", "conflict", "expansion"]).optional(),
      relatedCharacterId: z2.number().optional(),
      relatedLocationId: z2.number().optional()
    })).mutation(({ input }) => createEvent(input)),
    update: adminProcedure2.input(z2.object({
      id: z2.number(),
      year: z2.number().optional(),
      title: z2.string().optional(),
      description: z2.string().optional(),
      category: z2.enum(["origin", "discovery", "tragedy", "conflict", "expansion"]).optional(),
      relatedCharacterId: z2.number().optional(),
      relatedLocationId: z2.number().optional()
    })).mutation(({ input }) => {
      const { id, ...data } = input;
      return updateEvent(id, data);
    }),
    delete: adminProcedure2.input(z2.object({ id: z2.number() })).mutation(({ input }) => deleteEvent(input.id))
  }),
  // Concepts
  concepts: router({
    list: publicProcedure.query(() => getAllConcepts()),
    get: publicProcedure.input(z2.object({ id: z2.number() })).query(({ input }) => getConceptById(input.id)),
    create: adminProcedure2.input(z2.object({
      name: z2.string(),
      category: z2.enum(["energy", "technology", "entity", "philosophy", "other"]).optional(),
      shortDescription: z2.string().optional(),
      fullDescription: z2.string().optional(),
      properties: z2.string().optional(),
      manifestations: z2.string().optional(),
      imageUrl: z2.string().optional()
    })).mutation(({ input }) => createConcept(input)),
    update: adminProcedure2.input(z2.object({
      id: z2.number(),
      name: z2.string().optional(),
      category: z2.enum(["energy", "technology", "entity", "philosophy", "other"]).optional(),
      shortDescription: z2.string().optional(),
      fullDescription: z2.string().optional(),
      properties: z2.string().optional(),
      manifestations: z2.string().optional(),
      imageUrl: z2.string().optional()
    })).mutation(({ input }) => {
      const { id, ...data } = input;
      return updateConcept(id, data);
    }),
    delete: adminProcedure2.input(z2.object({ id: z2.number() })).mutation(({ input }) => deleteConcept(input.id))
  }),
  // Glitches (Narrative conflicts)
  glitches: router({
    list: publicProcedure.query(() => getAllGlitches()),
    unresolved: publicProcedure.query(() => getUnresolvedGlitches()),
    get: publicProcedure.input(z2.object({ id: z2.number() })).query(({ input }) => getGlitchById(input.id)),
    create: adminProcedure2.input(z2.object({
      title: z2.string(),
      severity: z2.enum(["critical", "major", "minor"]).optional(),
      description: z2.string().optional(),
      versionA: z2.string().optional(),
      versionB: z2.string().optional()
    })).mutation(({ input }) => createGlitch(input)),
    resolve: adminProcedure2.input(z2.object({
      id: z2.number(),
      resolution: z2.string()
    })).mutation(({ input, ctx }) => resolveGlitch(input.id, input.resolution, ctx.user.id)),
    update: adminProcedure2.input(z2.object({
      id: z2.number(),
      title: z2.string().optional(),
      severity: z2.enum(["critical", "major", "minor"]).optional(),
      description: z2.string().optional(),
      versionA: z2.string().optional(),
      versionB: z2.string().optional()
    })).mutation(({ input }) => {
      const { id, ...data } = input;
      return updateGlitch(id, data);
    }),
    delete: adminProcedure2.input(z2.object({ id: z2.number() })).mutation(({ input }) => deleteGlitch(input.id))
  }),
  // Search
  search: router({
    all: publicProcedure.input(z2.object({ query: z2.string() })).query(({ input }) => searchAll(input.query))
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/vite.ts
import express from "express";
import fs2 from "fs";
import { nanoid } from "nanoid";
import path2 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var PROJECT_ROOT = import.meta.dirname;
var LOG_DIR = path.join(PROJECT_ROOT, ".manus-logs");
var MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024;
var TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6);
function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}
function trimLogFile(logPath, maxSize) {
  try {
    if (!fs.existsSync(logPath) || fs.statSync(logPath).size <= maxSize) {
      return;
    }
    const lines = fs.readFileSync(logPath, "utf-8").split("\n");
    const keptLines = [];
    let keptBytes = 0;
    const targetSize = TRIM_TARGET_BYTES;
    for (let i = lines.length - 1; i >= 0; i--) {
      const lineBytes = Buffer.byteLength(`${lines[i]}
`, "utf-8");
      if (keptBytes + lineBytes > targetSize) break;
      keptLines.unshift(lines[i]);
      keptBytes += lineBytes;
    }
    fs.writeFileSync(logPath, keptLines.join("\n"), "utf-8");
  } catch {
  }
}
function writeToLogFile(source, entries) {
  if (entries.length === 0) return;
  ensureLogDir();
  const logPath = path.join(LOG_DIR, `${source}.log`);
  const lines = entries.map((entry) => {
    const ts = (/* @__PURE__ */ new Date()).toISOString();
    return `[${ts}] ${JSON.stringify(entry)}`;
  });
  fs.appendFileSync(logPath, `${lines.join("\n")}
`, "utf-8");
  trimLogFile(logPath, MAX_LOG_SIZE_BYTES);
}
function vitePluginManusDebugCollector() {
  return {
    name: "manus-debug-collector",
    transformIndexHtml(html) {
      if (process.env.NODE_ENV === "production") {
        return html;
      }
      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: {
              src: "/__manus__/debug-collector.js",
              defer: true
            },
            injectTo: "head"
          }
        ]
      };
    },
    configureServer(server) {
      server.middlewares.use("/__manus__/logs", (req, res, next) => {
        if (req.method !== "POST") {
          return next();
        }
        const handlePayload = (payload) => {
          if (payload.consoleLogs?.length > 0) {
            writeToLogFile("browserConsole", payload.consoleLogs);
          }
          if (payload.networkRequests?.length > 0) {
            writeToLogFile("networkRequests", payload.networkRequests);
          }
          if (payload.sessionEvents?.length > 0) {
            writeToLogFile("sessionReplay", payload.sessionEvents);
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        };
        const reqBody = req.body;
        if (reqBody && typeof reqBody === "object") {
          try {
            handlePayload(reqBody);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
          return;
        }
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          try {
            const payload = JSON.parse(body);
            handlePayload(payload);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
        });
      });
    }
  };
}
var plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime(), vitePluginManusDebugCollector()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    base: "./",
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1"
    ],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path2.resolve(import.meta.dirname, "../..", "dist", "public") : path2.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/_core/index.ts
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
startServer().catch(console.error);
