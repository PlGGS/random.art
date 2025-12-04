import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
    index("routes/app.tsx"),
    route("signin", "routes/signin.ts"),
    route("signout", "routes/signout.ts"),
    route("auth/callback", "routes/auth.callback.tsx"),
    route(":shortCode", "routes/link.tsx")
] satisfies RouteConfig;
