import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { setupWebSocket, sendNotification } from "./ws";
import { db } from "@db";
import { 
  projects, teams, teamMembers, timeEntries, notifications,
  insertProjectSchema, insertTeamSchema, insertTimeEntrySchema 
} from "@db/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Projects
  app.get("/api/projects", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const allProjects = await db.query.projects.findMany({
      with: { createdBy: true },
    });
    res.json(allProjects);
  });

  app.post("/api/projects", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const result = insertProjectSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).send(result.error.message);
    }

    const [project] = await db
      .insert(projects)
      .values({ ...result.data, createdById: req.user.id })
      .returning();
    
    res.json(project);
  });

  // Teams
  app.get("/api/teams", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const userTeams = await db.query.teams.findMany({
      with: {
        members: {
          with: {
            user: true,
          },
        },
        manager: true,
      },
    });
    
    res.json(userTeams);
  });

  app.post("/api/teams", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const result = insertTeamSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).send(result.error.message);
    }

    const [team] = await db
      .insert(teams)
      .values({ ...result.data, managerId: req.user.id })
      .returning();

    await db.insert(teamMembers).values({
      teamId: team.id,
      userId: req.user.id,
    });

    res.json(team);
  });

  // Time Entries
  app.get("/api/time-entries", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const { start, end } = req.query;
    let startDate = new Date();
    let endDate = new Date();

    if (start && end) {
      startDate = new Date(start as string);
      endDate = new Date(end as string);
    } else {
      startDate = startOfWeek(new Date());
      endDate = endOfWeek(new Date());
    }

    const entries = await db.query.timeEntries.findMany({
      where: and(
        eq(timeEntries.userId, req.user.id),
        gte(timeEntries.startTime, startDate),
        lte(timeEntries.startTime, endDate)
      ),
      with: {
        project: true,
      },
      orderBy: desc(timeEntries.startTime),
    });

    res.json(entries);
  });

  app.post("/api/time-entries", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const result = insertTimeEntrySchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).send(result.error.message);
    }

    const [entry] = await db
      .insert(timeEntries)
      .values({ ...result.data, userId: req.user.id })
      .returning();

    res.json(entry);
  });

  // Notifications
  app.get("/api/notifications", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const userNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, req.user.id))
      .orderBy(desc(notifications.createdAt));

    res.json(userNotifications);
  });

  const httpServer = createServer(app);
  setupWebSocket(httpServer, app);

  return httpServer;
}
