import express, { type Express } from "express";
import { engine } from "express-handlebars";
import path from "node:path";
import { viewsDir, publicDir } from "./paths.js";
import { rootRouter } from "./routes/router.js";

// Configure and return a fully initialized Express HTTP server
function server(port: number): Express {
    // Create the vanilla Express application instance
    const app: Express = express();

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

    // Register request parsers and static assets
    app.use(express.json());
    app.use(express.urlencoded({ extended: true, limit: "10kb" }));
    app.use(express.static(publicDir));

    // Mount the root router at the application root
    app.use("/", rootRouter());

    // Start the HTTP server and bind it to the TCP port defined in main.ts
    app.listen(port, () => {
        console.log(`Express server bound to port: ${port}`);
    });

    // Return the configured Express application instance
    return app;
}

// Export the instance
export { server };
