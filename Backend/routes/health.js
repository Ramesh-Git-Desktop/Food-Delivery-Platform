const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

router.get("/health", async (req, res) => {
  const startTime = Date.now();

  let dbStatus = "disconnected";
  try {
    if (mongoose.connection?.db) {
      await mongoose.connection.db.admin().ping();
      dbStatus = "connected";
    }
  } catch (error) {
    dbStatus = "error";
  }

  let redisStatus = "not_configured";
  try {
    const redis = req.app?.locals?.redis;
    if (redis?.ping) {
      await redis.ping();
      redisStatus = "connected";
    }
  } catch (error) {
    redisStatus = "error";
  }

  const uptimeSeconds = process.uptime();
  const memoryUsage = process.memoryUsage();
  const uptimeFormatted = `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor(
    (uptimeSeconds % 3600) / 60
  )}m ${Math.floor(uptimeSeconds % 60)}s`;

  const health = {
    status: dbStatus === "connected" ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    uptime: uptimeFormatted,
    services: {
      database: dbStatus,
      redis: redisStatus,
    },
    memory: {
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
    },
    responseTime: `${Date.now() - startTime}ms`,
  };

  const statusCode = health.status === "healthy" ? 200 : 503;
  res.status(statusCode).json(health);
});

module.exports = router;
