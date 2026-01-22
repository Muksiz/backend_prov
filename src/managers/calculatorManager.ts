import fs from "node:fs";
import path from "node:path";
import { dataDir } from "../paths.js";
import type { Calculator } from "../models/calculator.js";

// File-backed calculator storage
class CalculatorManager {
    // Absolute path to the JSON storage file
    private readonly storagePath: string;

    // Initialize storage location and load the calculators into memory
    constructor(storageFile = "calculators.json") {
        // Resolve the full path to the storage file
        this.storagePath = path.join(dataDir, storageFile);
    }

    // Load the calculators from disk, falling back to an empty array
    private readAll(): Calculator[] {
        // Make sure storage exists before reading
        this.ensureStorage();

        // Basic try/catch around file read + JSON parsing
        try {
            const raw: string = fs.readFileSync(this.storagePath, "utf8");

            // Treat empty files as an empty array
            if (!raw.trim()) {
                return [];
            }

            // JSON string -> JS objects
            const parsed: Calculator[] = JSON.parse(raw);

            // Guard against non-array JSON
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            // Fallback to empty array on read/parse errors
            return [];
        }
    }

    // Return the latest set of calculators from storage
    public getCalculators(): Calculator[] {
        return this.readAll();
    }

    // Find a calculator by its oid
    public getCalculatorByOid(oid: number): Calculator | null {
        const calculators: Calculator[] = this.readAll();

        // Find a matching oid
        const match: Calculator | undefined = calculators.find(
            (calculator) => calculator.oid === oid,
        );

        // Return the matching calculator, or null if none was found
        return match ?? null;
    }

    // Add a new calculator if the oid is unique
    public addCalculator(
        oid: number,
        manufacturer: string,
        grade: number,
        batteryType: number,
    ): Calculator | null {
        const calculators: Calculator[] = this.readAll();

        // Check for oid collisions
        const duplicate: Calculator | undefined = calculators.find(
            (calculator) => calculator.oid === oid,
        );

        if (duplicate) {
            return null;
        }

        // Construct the new calculator
        const newCalculator: Calculator = {
            oid,
            manufacturer,
            grade,
            batteryType,
        };

        // Mutate in-memory list and write to disk
        calculators.push(newCalculator);
        this.writeAll(calculators);
        return newCalculator;
    }

    // Edit an existing calculator by oid
    public editCalculator(
        oid: number,
        manufacturer: string,
        grade: number,
        batteryType: number,
    ): Calculator | null {
        const calculators: Calculator[] = this.readAll();

        // Locate the target calculator
        const calculator: Calculator | undefined = calculators.find(
            (item) => item.oid === oid,
        );

        if (!calculator) {
            return null;
        }

        // Update content and write to disk
        calculator.manufacturer = manufacturer;
        calculator.grade = grade;
        calculator.batteryType = batteryType;
        this.writeAll(calculators);
        return calculator;
    }

    // Remove a calculator by oid
    public deleteCalculator(oid: number): boolean {
        const calculators: Calculator[] = this.readAll();

        // Filter out the calculator to delete
        const remaining: Calculator[] = calculators.filter(
            (calculator) => calculator.oid !== oid,
        );

        // Stop if no progress was made (nothing was removed from the remaining list)
        if (remaining.length === calculators.length) {
            return false;
        }

        // Write the filtered list to disk
        this.writeAll(remaining);
        return true;
    }

    // Ensure the storage directory and file exist
    private ensureStorage(): void {
        // Ensure the storage directory exists before accessing the file
        const dir: string = path.dirname(this.storagePath);

        // Create the directory if it does not exist
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Create the storage file if missing and initialize it as an empty array
        if (!fs.existsSync(this.storagePath)) {
            // Start with an empty list
            fs.writeFileSync(this.storagePath, "[]", "utf8");
        }
    }

    // Write the current calculators array to disk
    private writeAll(calculators: Calculator[]): void {
        // Ensure storage is ready before writing
        this.ensureStorage();

        // JS objects -> JSON string for storage
        const data: string = JSON.stringify(calculators, null, 2);

        // fs module: write JSON to disk
        fs.writeFileSync(this.storagePath, data, "utf8");
    }
}

export default CalculatorManager;
