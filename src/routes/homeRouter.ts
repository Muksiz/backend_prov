import { Router } from "express";
import HomeController from "../controllers/homeController.js";

// Create and configure the home router
function homeRouter(): Router {
    // Create a new Express router instance
    const router = Router();

    // Create the home controller
    const controller = new HomeController();

    // Register GET routes for pages and JSON endpoints
    // === GET/POST routing to controller handlers ===
    router.get("/", controller.getIndex);
    router.get("/home", controller.getIndex);
    router.get("/index", controller.getIndex);
    router.get("/about", controller.getAbout);
    router.get("/help", controller.getHelp);
    router.get("/weather", controller.getWeather);
    router.get("/login", controller.getLogin);
    router.post("/login", controller.postLogin);
    router.get("/logout", controller.getLogout);

    // Return the configured router
    return router;
}

// Export the router
export { homeRouter };
