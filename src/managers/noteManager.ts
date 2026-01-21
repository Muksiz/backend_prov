import fs from "node:fs";
import path from "node:path";
import { dataDir } from "../paths.js";
import type { Note } from "../models/note.js";

// File-backed note storage and CRUD operations
class NoteManager {
    // Absolute path to the JSON storage file
    private readonly storagePath: string;
    // In-memory cache of notes
    private notes: Note[];

    // Initialize storage location and load notes into memory
    constructor(storageFile = "notes.json") {
        // Resolve the full path to the storage file
        this.storagePath = path.join(dataDir, storageFile);
        // Prime the cache from disk
        this.notes = this.loadNotes();
    }

    // Load notes from disk, falling back to an empty list
    public loadNotes(): Note[] {
        // Make sure storage exists before reading
        this.ensureStorage();
        // === try/catch around fs read + JSON parse ===
        try {
            // Basic try/catch around file read + JSON parsing
            const raw = fs.readFileSync(this.storagePath, "utf8");
            // Treat empty files as no notes
            if (!raw.trim()) {
                // === array literal for empty collections ===
                this.notes = [];
                return this.notes;
            }

            // JSON string -> JS objects
            const parsed = JSON.parse(raw) as Note[];
            // Guard against non-array JSON
            this.notes = Array.isArray(parsed) ? parsed : [];
            return this.notes;
        } catch {
            // Fallback to empty list on read/parse errors
            this.notes = [];
            return this.notes;
        }
    }

    // Return the latest set of notes from storage
    public getNotes(): Note[] {
        // Always return the latest on-disk state
        return this.loadNotes();
    }

    // Find a note by its title
    public getNoteByTitle(title: string): Note | null {
        // Reload to avoid stale cache
        const notes = this.loadNotes();
        // Find a matching title
        const match = notes.find((note) => note.title === title);
        return match ?? null;
    }

    // Add a new note if the title is unique
    public addNote(title: string, body: string): Note | null {
        // Reload to avoid overwriting external changes
        const notes = this.loadNotes();
        // Check for title collisions
        const duplicate = notes.find((note) => note.title === title);
        if (duplicate) {
            return null;
        }

        // Construct the new note
        const newNote: Note = { title, body };
        // Mutate in-memory list and persist
        notes.push(newNote);
        this.notes = notes;
        this.saveNotes();
        return newNote;
    }

    // Update an existing note body by title
    public updateNote(title: string, body: string): Note | null {
        // Reload to avoid stale data
        const notes = this.loadNotes();
        // Locate the target note
        const note = notes.find((item) => item.title === title);
        if (!note) {
            return null;
        }

        // Update content and persist
        note.body = body;
        this.notes = notes;
        this.saveNotes();
        return note;
    }

    // Remove a note by title
    public removeNote(title: string): boolean {
        // Reload to avoid stale data
        const notes = this.loadNotes();
        // Filter out the note to delete
        const remaining = notes.filter((note) => note.title !== title);
        if (remaining.length === notes.length) {
            return false;
        }

        // Persist the filtered list
        this.notes = remaining;
        this.saveNotes();
        return true;
    }

    // Ensure the storage directory and file exist
    private ensureStorage(): void {
        // Create missing directories and file on demand
        const dir = path.dirname(this.storagePath);
        // fs module: check + create the data directory if needed
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // fs module: create the JSON file if missing
        if (!fs.existsSync(this.storagePath)) {
            // Start with an empty list
            fs.writeFileSync(this.storagePath, "[]", "utf8");
        }
    }

    // Persist the current notes array to disk
    private saveNotes(): void {
        // Ensure storage is ready before writing
        this.ensureStorage();
        // === JSON stringify then fs write ===
        // JS objects -> JSON string for storage
        const data = JSON.stringify(this.notes, null, 2);
        // fs module: write JSON to disk
        fs.writeFileSync(this.storagePath, data, "utf8");
    }
}

// === default export style ===
export default NoteManager;
