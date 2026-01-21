import express, { type Express } from "express";
import { engine } from "express-handlebars";
import path from "node:path";
import { viewsDir, publicDir } from "./paths.js";
import { rootRouter } from "./routes/router.js";
import { authMiddleware } from "./middleware/auth.js";

// Configure the Express HTTP application.
// Returns a fully initialized Express app instance.
// === named function declaration ===
function server(port: number): Express {
    // Create the vanilla Express application instance
    const app = express();

    // Handlebars template engine settings
    app.engine(
        "hbs",
        engine({
            extname: ".hbs",
            defaultLayout: "main",
            layoutsDir: path.join(viewsDir, "layouts"),
            partialsDir: path.join(viewsDir, "partials"),
        }),
    );

    // Select Handlebars for view rendering and set the views directory
    app.set("view engine", "hbs");
    app.set("views", viewsDir);

    // Register middleware for request body parsing and static asset delivery.
    // Enables JSON and URL-encoded form parsing, and serves files from the public directory.
    app.use(express.json());
    app.use(express.urlencoded({ extended: true, limit: "10kb" }));
    // === static file hosting in Express ===
    app.use(express.static(publicDir));
    app.use(authMiddleware());

    // Mount the root router at the application root
    app.use("/", rootRouter());

    // Start the HTTP server and bind it to the TCP port defined in main.ts
    app.listen(port, () => {
        // === template literal string ===
        console.log(`Express server bound to port: ${port}`);
    });

    // Return the configured Express application instance
    return app;
}

// === named export style ===
// Export the instance
export { server };
