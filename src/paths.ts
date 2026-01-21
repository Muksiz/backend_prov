import path from "node:path";
import { fileURLToPath } from "node:url";

// Convert the current ES module URL into an absolute filesystem path.
// This is required because ES modules do not provide __filename automagically.
const __filename = fileURLToPath(import.meta.url);

// Resolve the absolute directory path of the current module
const __dirname = path.dirname(__filename);

// Directory used for JSON-based data storage
// (src/data during development, dist/data after build).
const dataDir = path.join(__dirname, "data");

// Directory containing Handlebars view templates
const viewsDir = path.join(__dirname, "views");

// Directory containing publicly served static assets
const publicDir = path.join(__dirname, "public");

// Export resolved directory paths for use across the application
export { viewsDir, publicDir, dataDir };
