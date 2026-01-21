import type { Request, Response, RequestHandler } from "express";
import NoteManager from "../managers/noteManager.js";
import type { Note } from "../models/note.js";

// Route params for note routes that include a title
interface NoteRouteParams {
    title: string;
}

// Expected fields from note form submissions
interface NoteFormBody {
    title?: string;
    body?: string;
}

// View model for the create/edit form template
interface FormOptions {
    mode: "Add" | "Edit";
    action: string;
    note?: Note | null;
    error?: string | null;
}

// Controller for note CRUD pages
class NoteController {
    // Note storage and persistence helper
    private readonly noteManager: NoteManager;

    // Inject the note manager dependency
    constructor(noteManager: NoteManager) {
        this.noteManager = noteManager;
    }

    // Render the notes index page
    public getIndex: RequestHandler = (_req: Request, res: Response): void => {
        // Map notes with URL-safe titles for links
        const notes = this.noteManager.getNotes().map((note) => ({
            ...note,
            encodedTitle: encodeURIComponent(note.title),
        }));
        // Pass list and helper flags to the template
        res.render("notes/noteIndex", {
            title: "Notes",
            notes,
            hasNotes: notes.length > 0,
        });
    };

    // Render the empty create form
    public getCreate: RequestHandler = (_req: Request, res: Response): void => {
        // Render with empty note fields
        this.renderForm(res, {
            mode: "Add",
            action: "/notes/create",
            note: null,
        });
    };

    // Create a new note from submitted form data
    public postCreate: RequestHandler = (req: Request, res: Response): void => {
        // === form submission handling from req.body ===
        // Pull and normalize input values
        const { title, body } = req.body as NoteFormBody;
        const cleanedTitle = title?.trim() ?? "";
        const cleanedBody = body?.trim() ?? "";

        // Validate required fields
        if (!cleanedTitle || !cleanedBody) {
            // Echo back user input on validation failure
            this.renderForm(res, {
                mode: "Add",
                action: "/notes/create",
                note: { title: cleanedTitle, body: cleanedBody },
                error: "Both title and body are required.",
            });
            return;
        }

        // Try to store the new note
        const stored = this.noteManager.addNote(cleanedTitle, cleanedBody);
        if (!stored) {
            // Duplicate titles are not allowed
            this.renderForm(res, {
                mode: "Add",
                action: "/notes/create",
                note: { title: cleanedTitle, body: cleanedBody },
                error: "A note with that title already exists.",
            });

            return;
        }

        // Back to the list after successful creation
        res.redirect("/notes/index");
    };

    // Render the edit form for a note
    public getUpdate: RequestHandler<NoteRouteParams> = (
        req: Request<NoteRouteParams>,
        res: Response,
    ): void => {
        const { title } = req.params;

        // Load the note to edit
        const selected = this.noteManager.getNoteByTitle(title);

        // If the note is missing, go back to the list
        if (!selected) {
            // Nothing to edit, redirect
            res.redirect("/notes/index");
            return;
        }

        // Show the edit form with existing data
        this.renderForm(res, {
            mode: "Edit",
            action: `/notes/update/${encodeURIComponent(title)}`,
            note: selected,
        });
    };

    // Delete a note and return to the list
    public getDelete: RequestHandler<NoteRouteParams> = (
        req: Request<NoteRouteParams>,
        res: Response,
    ): void => {
        const { title } = req.params;

        // Attempt deletion even if it may not exist
        this.noteManager.removeNote(title);

        // Always return to the index after deletion
        res.redirect("/notes/index");
    };

    // Persist edits to an existing note
    public postUpdate: RequestHandler<NoteRouteParams> = (
        req: Request<NoteRouteParams>,
        res: Response,
    ): void => {
        const { title } = req.params;

        // Pull and normalize the updated body
        const { body } = req.body as NoteFormBody;
        const cleanedBody = body?.trim() ?? "";

        // Validate body is present
        if (!cleanedBody) {
            // Re-render form with error and existing data
            const existing = this.noteManager.getNoteByTitle(title);
            this.renderForm(res, {
                mode: "Edit",
                action: `/notes/update/${encodeURIComponent(title)}`,
                note: existing ?? { title, body: cleanedBody },
                error: "Body is required.",
            });
            return;
        }

        // Apply the update and return to list
        const updated = this.noteManager.updateNote(title, cleanedBody);
        if (!updated) {
            // If the note disappeared, just go back
            res.redirect("/notes/index");
            return;
        }

        // Back to the list after successful update
        res.redirect("/notes/index");
    };

    // Render the shared form view with computed options
    private renderForm(res: Response, options: FormOptions): void {
        res.render("notes/noteForm", {
            title: options.mode === "Add" ? "Add Note" : "Edit Note",
            mode: options.mode,
            action: options.action,
            noteTitle: options.note?.title ?? "",
            noteBody: options.note?.body ?? "",
            isEdit: options.mode === "Edit",
            // Null means "no error" to the template
            error: options.error ?? null,
        });
    }
}

export default NoteController;
