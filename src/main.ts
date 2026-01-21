import { server } from "./express.js";
import { setUsers } from "./middleware/auth.js";
import type { UserRecord } from "./middleware/auth.js";

// Application entry point
function main(): void {
    // TCP port the HTTP server will bind to
    // === TypeScript types in use ===
    const port: number = 5000;

    // Static user record used for authentication
    // === const with object literal key/value pairs ===
    const users: UserRecord = {
        email: "dev@dev",
        password: "devdev",
    };

    // Register authentication users before starting the server
    setUsers(users);

    // Initialize and start the Express server
    server(port);
}

// Invoke the application entry function
main();
