import type { NextFunction, Request, Response } from "express";
import { client } from "../config/redis.js";

export async function idempotencyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const idempotencyKey = req.header("Idempotency-Key");
    if (!idempotencyKey) {
      return res.status(400).json({
        error: "Idempotency-Key header is required",
      });
    }

    const cacheKey = `Idempotency:${idempotencyKey}`;

    const cachedValue = await client.get(cacheKey);
    if (cachedValue) {
      const parsed = JSON.parse(cachedValue) as { operationStatus: boolean };
      if (parsed.operationStatus) {
        return res.status(409).json({
          error:
            "Duplicate request detected. This operation has already been processed.",
        });
      } else {
        return res.status(202).json({
          message:
            "This operation is currently being processed. Please wait for the result.",
        });
      }
    } else {
      await client.set(cacheKey, JSON.stringify({ operationStatus: false }), {
        EX: 60 * 5,
        NX: true,
      });
    }

    next();
  } catch (error: any) {
    next(error);
  }
}
