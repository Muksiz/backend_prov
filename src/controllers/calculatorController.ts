import type { RequestHandler } from "express";
import CalculatorManager from "../managers/calculatorManager.js";
import type { Calculator } from "../models/calculator.js";

/*
 * Some fields are typed as strings because values coming from HTTP
 * requests are always received as strings. Even if the value represents
 * a number, it must be parsed and validated before being used as one.
 */

// URL parameters for calculator requests
interface CalculatorRouteParams {
    oid: number;
}

// Expected fields from calculator form submissions
interface CalculatorFormBody {
    oid?: string;
    manufacturer?: string;
    grade?: string;
    batteryType?: string;
}

// View model for the create/edit form template
interface FormOptions {
    mode: "Add" | "Edit";
    action: string;
    calculator?: Calculator | null;
    values?: {
        oid: string;
        manufacturer: string;
        grade: string;
        batteryType: string;
    };
    error?: string;
}

// Controller responsible for rendering and handling calculator CRUD operations
class CalculatorController {
    // Validation limits for calculator fields
    private static readonly gradeMin = 0;
    private static readonly gradeMax = 10;
    private static readonly batteryMin = 1;
    private static readonly batteryMax = 3;

    // Fallback error message used for invalid form submissions
    private static readonly genericError =
        "Invalid input. Please check the form fields.";

    // Handles calculator data access for this controller
    private readonly calculatorManager: CalculatorManager;

    // Create the controller with its required manager dependency
    constructor(calculatorManager: CalculatorManager) {
        this.calculatorManager = calculatorManager;
    }

    // Parse and validate an integer value from HTTP input
    private parseInt(value: unknown): number | null {
        // Accept numbers only if they already are valid integers
        if (typeof value === "number") {
            return Number.isInteger(value) ? value : null;
        }

        // Reject values that are neither strings nor numbers
        if (typeof value !== "string") {
            return null;
        }

        // Trim whitespace and reject empty input
        const trimmed: string = value.trim();
        if (!trimmed) {
            return null;
        }

        // Convert string input to a number and ensure it is an integer
        const parsed: number = Number(trimmed);
        if (!Number.isInteger(parsed)) {
            return null;
        }

        return parsed;
    }

    // Check that a value is an integer within the given range
    private isIntInRange(value: number, min: number, max: number): boolean {
        return Number.isInteger(value) && value >= min && value <= max;
    }

    // Validate required fields and presence before further checks
    private validateFields(
        manufacturer: string,
        grade: number | null,
        batteryType: number | null,
    ): { ok: boolean; error: string } {
        // Ensure all required fields are present and successfully parsed
        if (!manufacturer || grade === null || batteryType === null) {
            return {
                ok: false,
                error: CalculatorController.genericError,
            };
        }

        // Validate numeric fields against their allowed ranges
        if (
            !this.isIntInRange(
                grade,
                CalculatorController.gradeMin,
                CalculatorController.gradeMax,
            ) ||
            !this.isIntInRange(
                batteryType,
                CalculatorController.batteryMin,
                CalculatorController.batteryMax,
            )
        ) {
            return {
                ok: false,
                error: CalculatorController.genericError,
            };
        }

        return { ok: true, error: "" };
    }

    // Parse and normalize form input into raw strings and parsed numeric values
    private parseFormBody(body: CalculatorFormBody): {
        // Raw values preserved for re-displaying the form
        oidRaw: string;
        gradeRaw: string;
        batteryTypeRaw: string;

        // Parsed values used by the controller
        oid: number | null;
        manufacturer: string;
        grade: number | null;
        batteryType: number | null;
    } {
        // Extract submitted form fields
        const { oid, manufacturer, grade, batteryType } = body;

        // Normalize manufacturer input
        const cleanedManufacturer: string = manufacturer?.trim() ?? "";

        return {
            // Preserve raw input values
            oidRaw: oid ?? "",
            gradeRaw: grade ?? "",
            batteryTypeRaw: batteryType ?? "",

            // Store cleaned and parsed values
            manufacturer: cleanedManufacturer,
            oid: this.parseInt(oid),
            grade: this.parseInt(grade),
            batteryType: this.parseInt(batteryType),
        };
    }

    // Render the calculators index page
    public getIndex: RequestHandler = (_req, res): void => {
        // Map calculators with URL-safe titles for links
        const calculators = this.calculatorManager
            .getCalculators()
            .map((calculator) => ({
                ...calculator,
                encodedTitle: encodeURIComponent(calculator.oid),
            }));

        // Render the index template with the calculator list
        res.render("calculators/calculatorIndex", {
            title: "Calculators",
            calculators,
            hasCalculators: calculators.length > 0,
        });
    };

    // Render the empty create form
    public getCreate: RequestHandler = (_req, res): void => {
        // Render with empty calculator fields
        this.renderForm(res, {
            mode: "Add",
            action: "/calculators/create",
            calculator: null,
        });
    };

    // Create a new calculator from submitted form data
    public postCreate: RequestHandler = (req, res): void => {
        // Pull and normalize input values
        const parsedForm = this.parseFormBody(req.body as CalculatorFormBody);

        // Validate required fields and numeric ranges
        const validation = this.validateFields(
            parsedForm.manufacturer,
            parsedForm.grade,
            parsedForm.batteryType,
        );

        // Abort and re-render the form if validation fails
        if (
            parsedForm.oid === null ||
            parsedForm.grade === null ||
            parsedForm.batteryType === null ||
            !validation.ok
        ) {
            // Echo back user input on validation failure
            this.renderForm(res, {
                mode: "Add",
                action: "/calculators/create",
                values: {
                    oid: parsedForm.oidRaw,
                    manufacturer: parsedForm.manufacturer,
                    grade: parsedForm.gradeRaw,
                    batteryType: parsedForm.batteryTypeRaw,
                },
                error: CalculatorController.genericError,
            });

            return;
        }

        // Try to store the new calculator
        const stored: Calculator | null = this.calculatorManager.addCalculator(
            parsedForm.oid,
            parsedForm.manufacturer,
            parsedForm.grade,
            parsedForm.batteryType,
        );

        // Re-render the form if creation fails due to a duplicate oid
        if (!stored) {
            this.renderForm(res, {
                mode: "Add",
                action: "/calculators/create",
                values: {
                    oid: String(parsedForm.oid),
                    manufacturer: parsedForm.manufacturer,
                    grade: String(parsedForm.grade),
                    batteryType: String(parsedForm.batteryType),
                },
                error: CalculatorController.genericError,
            });

            return;
        }

        // Redirect to the list view
        res.redirect("/calculators");
    };

    // Render the edit form for an existing calculator
    public getEdit: RequestHandler<CalculatorRouteParams> = (
        req,
        res,
    ): void => {
        // Extract the calculator identifier from the URL
        const { oid } = req.params;

        // Parse and validate the identifier
        const parsedOid: number | null = this.parseInt(oid);

        // Redirect to the list if the identifier is invalid
        if (parsedOid === null) {
            res.redirect("/calculators");
            return;
        }

        // Retrieve the calculator to be edited
        const selected = this.calculatorManager.getCalculatorByOid(parsedOid);

        // Redirect if the calculator does not exist
        if (!selected) {
            res.redirect("/calculators");
            return;
        }

        // Render the edit form pre-filled with the existing calculator data
        this.renderForm(res, {
            mode: "Edit",
            action: `/calculators/edit/${encodeURIComponent(oid)}`,
            calculator: selected,
        });
    };

    // Delete a calculator by its identifier
    public postDelete: RequestHandler<CalculatorRouteParams> = (
        req,
        res,
    ): void => {
        // Extract the calculator identifier from the URL
        const { oid } = req.params;

        // Parse and validate the identifier
        const parsedOid: number | null = this.parseInt(oid);

        // Redirect to the list if the identifier is invalid
        if (parsedOid === null) {
            res.redirect("/calculators");
            return;
        }

        // Attempt deletion even if it may not exist
        this.calculatorManager.deleteCalculator(parsedOid);

        // Return to the calculators index after deletion
        res.redirect("/calculators");
    };

    // Apply updates to an existing calculator
    public postEdit: RequestHandler<CalculatorRouteParams> = (
        req,
        res,
    ): void => {
        // Extract the calculator identifier from the URL
        const { oid } = req.params;

        // Parse and validate the identifier
        const parsedOid: number | null = this.parseInt(oid);

        // Redirect to the list if the identifier is invalid
        if (parsedOid === null) {
            res.redirect("/calculators");
            return;
        }

        // Parse and normalize submitted form input
        const parsedForm = this.parseFormBody(req.body as CalculatorFormBody);

        // Validate required fields and numeric ranges
        const validation = this.validateFields(
            parsedForm.manufacturer,
            parsedForm.grade,
            parsedForm.batteryType,
        );

        // Re-render the edit form if validation fails
        if (
            !validation.ok ||
            parsedForm.grade === null ||
            parsedForm.batteryType === null
        ) {
            // Reload existing calculator data for form re-display
            const existing: Calculator | null =
                this.calculatorManager.getCalculatorByOid(parsedOid);

            // Re-render the edit form with user input and a validation error
            this.renderForm(res, {
                mode: "Edit",
                action: `/calculators/edit/${encodeURIComponent(oid)}`,
                calculator: existing,
                values: {
                    oid: String(parsedOid),
                    manufacturer: parsedForm.manufacturer,
                    grade: parsedForm.gradeRaw,
                    batteryType: parsedForm.batteryTypeRaw,
                },

                error: CalculatorController.genericError,
            });

            return;
        }

        // Apply the validated updates to the calculator
        const updated: Calculator | null =
            this.calculatorManager.editCalculator(
                parsedOid,
                parsedForm.manufacturer,
                parsedForm.grade,
                parsedForm.batteryType,
            );

        // Redirect if the calculator no longer exists
        if (!updated) {
            res.redirect("/calculators");
            return;
        }

        // Redirect to the calculators index after a successful update
        res.redirect("/calculators");
    };

    // Render the calculator form with resolved values and view options
    private renderForm(
        res: Parameters<RequestHandler>[1],
        options: FormOptions,
    ): void {
        // Default empty values for the create form
        let values = {
            oid: "",
            manufacturer: "",
            grade: "",
            batteryType: "",
        };

        // Populate values from the existing calculator when editing
        if (options.calculator) {
            values = {
                oid: String(options.calculator.oid),
                manufacturer: options.calculator.manufacturer,
                grade: String(options.calculator.grade),
                batteryType: String(options.calculator.batteryType),
            };
        }

        // Override with explicitly provided values when re-rendering after validation errors
        if (options.values) {
            values = options.values;
        }

        // Set the page title and edit flag based on the form mode
        const title =
            options.mode === "Add" ? "Add Calculator" : "Edit Calculator";

        const isEdit = options.mode === "Edit";

        // Render the calculator form with resolved values and view state
        res.render("calculators/calculatorForm", {
            title,
            mode: options.mode,
            action: options.action,
            oid: values.oid,
            manufacturer: values.manufacturer,
            grade: values.grade,
            batteryType: values.batteryType,
            isEdit,
            error: options.error ?? null,
        });
    }
}

export default CalculatorController;
