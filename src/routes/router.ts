import { Router } from "express";
import { calculatorsRouter } from "./calculatorsRouter.js";

// Create and configure the root router
function rootRouter(): Router {
    // Create a new Express router instance
    const router: Router = Router();

    // Send the root page to the calculators index
    router.get("/", (_req, res) => {
        res.redirect("/calculators");
    });

    // Mount feature routers under their respective base paths
    router.use("/calculators", calculatorsRouter());

    // Return the configured router
    return router;
}

// Export the router
export { rootRouter };
