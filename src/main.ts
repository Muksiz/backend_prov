/*
 * main.ts is the application entry point. In many
 * languages (especially compiled ones), a main()
 * function defines where program execution begins.
 */

import { server } from "./express.js";

// Application entry point
function main(): void {
    // TCP port on which the HTTP server will listen
    const port: number = 5000;

    // Start the Express server
    server(port);
}

// Invoke the application entry point
main();
