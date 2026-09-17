import app from "./app.js";
import dotenv from "dotenv";
import { connectRedis } from "./config/redis.js";
dotenv.config();

const PORT = process.env.PORT || 3000;

await connectRedis();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
