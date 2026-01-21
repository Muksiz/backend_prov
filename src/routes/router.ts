import { Router } from "express";
import { homeRouter } from "./homeRouter.js";
import { notesRouter } from "./notesRouter.js";

// Create and configure the root router
function rootRouter(): Router {
    // Create a new Express router instance
    const router = Router();

    // Mount feature routers under their respective base paths
    // === routing and the request -> router -> controller flow ===
    router.use("/", homeRouter());
    router.use("/notes", notesRouter());

    // Return the configured router
    return router;
}

// Export the router
export { rootRouter };
