import type { Request, Response, NextFunction, RequestHandler } from "express";

// Auth-specific user record scoped to middleware (not a shared domain model yet).
interface UserRecord {
    // Login email used for in-memory auth.
    email: string;
    // Login password used for in-memory auth.
    password: string;
}

// In-memory user record used for simple auth.
// === let for mutable module state ===
let users: UserRecord | null = null;

// Tracks current authentication state.
let loggedIn = false;

// Register the known user record.
function setUsers(nextUsers: UserRecord): void {
    users = nextUsers;
}

// Update the login state flag.
function setLoggedIn(value: boolean): void {
    loggedIn = value;
}

// Read the current login state flag.
function isLoggedIn(): boolean {
    return loggedIn;
}

// Check incoming credentials against the stored user record.
function isValidUser(email: string, password: string): boolean {
    if (!users) {
        return false;
    }

    return users.email === email && users.password === password;
}

// Build middleware that exposes auth state on the response locals.
function authMiddleware(): RequestHandler {
    // Request handler for marking auth status on each request.
    return function authMiddleware(
        _req: Request,
        res: Response,
        next: NextFunction,
    ): void {
        res.locals["isAuthenticated"] = isLoggedIn();

        // Continue through the middleware chain.
        next();
    };
}

export {
    authMiddleware,
    isLoggedIn,
    isValidUser,
    setLoggedIn,
    setUsers,
    type UserRecord,
};
