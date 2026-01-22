import path from "node:path";
import { fileURLToPath } from "node:url";

// Convert the ES module URL into __filename for path resolution
const __filename: string = fileURLToPath(import.meta.url);

// Resolve the absolute directory path of the current module
const __dirname: string = path.dirname(__filename);

// Directory used for JSON-based data storage
const dataDir: string = path.join(__dirname, "data");

// Directory containing Handlebars view templates
const viewsDir: string = path.join(__dirname, "views");

// Directory containing publicly served static assets
const publicDir: string = path.join(__dirname, "public");

// Export resolved directory paths for use across the application
export { viewsDir, publicDir, dataDir };
