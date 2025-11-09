import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
    index("routes/app.tsx"),
    route("nothome", "routes/nothome.tsx"),
    route(":shortCode", "routes/link.tsx")
] satisfies RouteConfig;
