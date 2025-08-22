import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { RouteManager } from "./routes/manager";

const app = new Hono();
const routeManager = new RouteManager();

app.use("/*", serveStatic({ root: "public" }));
app.route("/", routeManager.getApp());

export default app;