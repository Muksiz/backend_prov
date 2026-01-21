## Running or building

Begin by downloading the required Node.js dependencies:

```sh
npm i
```

Next, run the application. This also watches the `src` directory for file
changes, not limited to `.ts` files.

```sh
npm run dev
```

### Why?

This uses **tsx** as a TypeScript runtime, allowing TypeScript files
to be executed directly in Node.js without a separate build step. Less clutter.

Alternatively, you can build the project, or build & run the compiled output:

```sh
npm run build
npm run build:run
```

## The JavaScript Debug Terminal

### 1) Set breakpoints

- Open the TypeScript file you want to debug
- Add breakpoints where execution should pause

### 2) Open a JavaScript Debug Terminal

- Open the **Run And Debug** view in VS Code:
    - **Ctrl + Shift + D**
- Select: **JavaScript Debug Terminal**

### 3) Start the application from the debug terminal

```sh
npm run dev
```

### Why?

Some people like to keep their codebase free of proprietary, Microsoft-specific
editor configuration clutter.
