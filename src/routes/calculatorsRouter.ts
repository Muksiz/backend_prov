import { Router } from "express";
import CalculatorController from "../controllers/calculatorController.js";
import CalculatorManager from "../managers/calculatorManager.js";

// Create and configure the calculators router
function calculatorsRouter(): Router {
    // Create a new Express router instance
    const router: Router = Router();

    // Create the calculator manager and bind it to the controller
    const calculatorManager = new CalculatorManager();
    const controller = new CalculatorController(calculatorManager);

    // Register GET routes for rendering calculator-related pages and forms
    router.get("/", controller.getIndex);
    router.get("/create", controller.getCreate);
    router.get("/edit/:oid", controller.getEdit);

    // Register POST routes for handling calculator form submissions
    router.post("/create", controller.postCreate);
    router.post("/edit/:oid", controller.postEdit);
    router.post("/delete/:oid", controller.postDelete);

    // Return the configured router
    return router;
}

// Export the router
export { calculatorsRouter };
