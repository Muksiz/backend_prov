import { Router } from "express";
import NoteController from "../controllers/noteController.js";
import NoteManager from "../managers/noteManager.js";

// Create and configure the notes router
function notesRouter(): Router {
    // Create a new Express router instance
    const router = Router();

    // Create the note manager and bind it to the controller
    const noteManager = new NoteManager();
    const controller = new NoteController(noteManager);

    // Register GET routes for rendering note-related pages and forms
    router.get("/index", controller.getIndex);
    router.get("/create", controller.getCreate);
    router.get("/update/:title", controller.getUpdate);
    router.get("/delete/:title", controller.getDelete);

    // Register POST routes for handling note form submissions
    router.post("/create", controller.postCreate);
    router.post("/update/:title", controller.postUpdate);

    // Return the configured router
    return router;
}

// Export the router
export { notesRouter };
