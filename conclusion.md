# Data Flow Guide (Beginner Friendly)

This document explains how data moves through this TypeScript/Express project.
It focuses on where data comes from, how it is validated, where it is stored,
and how it gets back to the browser.

## Big Picture (Request -> Response)

1) A browser sends an HTTP request (GET or POST).
2) Express receives the request and passes it to a route.
3) The route calls a controller method.
4) The controller reads input data, validates it, and calls the manager.
5) The manager reads/writes JSON on disk.
6) The controller sends a response (HTML page or redirect).

## Startup: where the server comes from

- `src/main.ts` is the entry point.
  - It calls `server(5000)`.
- `src/express.ts` builds the Express app.
  - It sets up Handlebars templates.
  - It adds body parsers (`express.json()` and `express.urlencoded()`).
  - It serves static files from `src/public`.
  - It mounts the root router at `/`.
  - It starts listening on port 5000.

## Routing: how requests are matched

- `src/routes/router.ts`
  - `GET /` redirects to `/calculators`.
  - `/calculators` is handled by the calculators router.

- `src/routes/calculatorsRouter.ts`
  - Creates a `CalculatorManager` and passes it into `CalculatorController`.
  - Registers routes:
    - `GET /calculators` -> list page
    - `GET /calculators/create` -> empty form
    - `POST /calculators/create` -> create new item
    - `GET /calculators/edit/:oid` -> edit form
    - `POST /calculators/edit/:oid` -> update item
    - `POST /calculators/delete/:oid` -> delete item

## Controller: where input is validated

- `src/controllers/calculatorController.ts`
  - Input from the browser arrives as strings, even if it looks numeric.
  - The controller parses strings into numbers (`parseInt`).
  - It checks numeric ranges:
    - `grade` must be between 0 and 10.
    - `batteryType` must be between 1 and 3.
  - If validation fails, it re-renders the form and shows an error.

### Data coming in (requests)

- URL params (like `:oid`) come from the route, e.g. `/edit/123`.
- Form data comes from `req.body` because of `express.urlencoded()`.

### Data going out (responses)

- The controller uses `res.render(...)` to build HTML from Handlebars templates.
- It uses `res.redirect(...)` after successful create/edit/delete actions.

## Manager: where data is stored

- `src/managers/calculatorManager.ts` handles file storage.
- Storage is a JSON file on disk (default name: `calculators.json`).
- The file lives under `src/data/` at runtime (path is built in `src/paths.ts`).

### How storage works

- `readAll()` loads and parses the JSON file.
- `writeAll()` converts JS objects to JSON and writes them to disk.
- `ensureStorage()` creates the folder and file if they do not exist.

## Model: what a calculator looks like

- `src/models/calculator.ts` defines the shape:
  - `oid: number`
  - `manufacturer: string`
  - `grade: number`
  - `batteryType: number`

## Views: how data becomes HTML

- Layout: `src/views/layouts/main.hbs`
  - Wraps every page and inserts `{{{body}}}`.
- Index page: `src/views/calculators/calculatorIndex.hbs`
  - Receives `calculators`, `hasCalculators`.
  - Builds a table and links for edit/delete actions.
- Form page: `src/views/calculators/calculatorForm.hbs`
  - Receives `mode`, `action`, `oid`, `manufacturer`, `grade`, `batteryType`.
  - Uses `isEdit` to lock the OID field during edits.

## Concrete Data Flows

### 1) Show the list of calculators

- Browser: `GET /calculators`
- Controller: `getIndex()`
  - Calls `calculatorManager.getCalculators()`
  - Adds `encodedTitle` for safe URLs
  - Renders `calculatorIndex.hbs`
- Result: HTML table of calculators

### 2) Show the create form

- Browser: `GET /calculators/create`
- Controller: `getCreate()`
  - Renders `calculatorForm.hbs` with empty fields

### 3) Create a calculator

- Browser: `POST /calculators/create` with form fields
- Controller: `postCreate()`
  - Parses strings -> numbers
  - Validates ranges
  - Calls `addCalculator(...)`
- Manager: `addCalculator()`
  - Reads all calculators
  - Checks for duplicate `oid`
  - Writes new list to disk
- Controller:
  - If success, redirects to `/calculators`
  - If failure, re-renders the form with an error

### 4) Show the edit form

- Browser: `GET /calculators/edit/:oid`
- Controller: `getEdit()`
  - Parses `oid`
  - Loads calculator by `oid`
  - Renders `calculatorForm.hbs` with existing values

### 5) Update a calculator

- Browser: `POST /calculators/edit/:oid`
- Controller: `postEdit()`
  - Parses `oid` and form fields
  - Validates input
  - Calls `editCalculator(...)`
- Manager: `editCalculator()`
  - Finds matching calculator
  - Updates fields
  - Writes list to disk
- Controller:
  - Redirects to `/calculators` if successful

### 6) Delete a calculator

- Browser: `POST /calculators/delete/:oid`
- Controller: `postDelete()`
  - Parses `oid`
  - Calls `deleteCalculator(...)`
- Manager: `deleteCalculator()`
  - Filters it out
  - Writes the new list to disk
- Controller:
  - Redirects to `/calculators`

## Summary (one sentence)

Data flows from the browser into Express routes, through the controller for
parsing/validation, into the file-backed manager for storage, and then back out
as rendered Handlebars HTML or redirects.
