import type { Request, Response } from "express";
import { isLoggedIn, isValidUser, setLoggedIn } from "../middleware/auth.js";

// Controller for basic pages and auth routes
// === class-style controller with arrow-function handlers ===
class HomeController {
    // Render the home page
    public getIndex = (_req: Request, res: Response): void => {
        // === response rendering with res.render ===
        res.render("home", { title: "Home" });
    };

    // Render the about page
    public getAbout = (_req: Request, res: Response): void => {
        res.render("about", { title: "About" });
    };

    // Render the help page
    public getHelp = (_req: Request, res: Response): void => {
        res.render("help", { title: "Help" });
    };

    // Return a sample JSON response for weather
    public getWeather = (_req: Request, res: Response): void => {
        // === JSON response with an object literal ===
        res.json({
            forecast: "It is snowing",
            location: "Vaasa",
        });
    };

    // Render login or redirect if already authenticated
    public getLogin = (_req: Request, res: Response): void => {
        if (isLoggedIn()) {
            res.redirect("/notes/index");
            return;
        }

        res.render("login", { title: "Login" });
    };

    // Handle login form submission
    public postLogin = (req: Request, res: Response): void => {
        // === simple form handling via req.body ===
        // Pull credentials from the request body
        const { email, password } = req.body as {
            email?: string;
            password?: string;
        };

        // Validate credentials and mark the session as logged in
        if (email && password && isValidUser(email, password)) {
            setLoggedIn(true);
            res.redirect("/notes/index");
            return;
        }

        // Reject invalid logins with a helpful error message
        res.status(401).render("login", {
            title: "Login",
            error: "Invalid email or password.",
        });
    };

    // Clear auth state and return to the home page
    public getLogout = (_req: Request, res: Response): void => {
        setLoggedIn(false);
        res.redirect("/");
    };
}

export default HomeController;
