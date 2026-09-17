import type { NextFunction, Request, Response } from "express";
import { client, connectRedis } from "../config/redis.js";

export async function rateLimiter(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const ip = req.ip;
    const key = `rate-limit:${ip}`;
    const capacity = "2";
    const refillRate = "0.1";
    const now = Date.now().toString();

    const luaScript = `local key = KEYS[1]
    local cap = tonumber(ARGV[1])
    local refillRate = tonumber(ARGV[2])
    local currTime = tonumber(ARGV[3])
    local allowed = 0

    local data = redis.call("HMGET", key, "tokens", "lastRefill");
    local tokens = tonumber(data[1])
    local lastRefill = tonumber(data[2])

    if tokens == nil and lastRefill == nil then
        tokens = cap
        lastRefill = currTime
    else
        local timePassed = math.max(currTime - lastRefill, 0)
        tokens = math.min(tokens + (timePassed/1000)*refillRate, cap)
    end

    if tokens >= 1 then
        tokens = tokens-1
        allowed = 1
    end    
        
    redis.call("HMSET", key, "tokens", tokens, "lastRefill", currTime)

    redis.call("EXPIRE", key, math.ceil(cap/refillRate))

    return {allowed, tokens}`;
    const result = await client.eval(luaScript, {
      keys: [key],
      arguments: [capacity, refillRate, now],
    });

    const [allowed, remaining] = result as [number, number];

    res.setHeader("X-RateLimit-Limit", capacity);
    res.setHeader("X-RateLimit-Remaining", Math.floor(remaining).toString());

    if (allowed === 0) {
      res.setHeader("Retry-After", "1");
      return res.status(429).json({ error: "Rate-limit exceeded" });
    }

    next();
  } catch (error) {
    next(error);
  }
}
