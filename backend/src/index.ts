import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors"; // 1. Import cors
import { apiRoutes } from "./routes";

const app = new Elysia().use(cors()).use(apiRoutes).listen(3000);

console.log(`Server running at ${app.server?.hostname}:${app.server?.port}`);
