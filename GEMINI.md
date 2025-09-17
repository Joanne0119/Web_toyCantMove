# Project Overview

This is a web-based application, likely a multiplayer game, built with React and Vite. It uses Tailwind CSS for styling and React Router for navigation. The application appears to have a multi-step setup process for players, including entering a name, choosing a character, and waiting in a lobby.

## Technologies

*   **Framework:** React
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS
*   **Routing:** React Router
*   **Linting:** ESLint
*   **Languages:** JavaScript (JSX), TypeScript

## Project Structure

*   `src/`: Contains the main source code.
*   `src/components/`: Reusable React components.
*   `src/pages/`: Top-level page components used for routing.
*   `src/assets/`: Static assets like images and constants.
*   `public/`: Static assets that are not processed by Vite.
*   `vite.config.js`: Vite configuration file.
*   `package.json`: Project dependencies and scripts.

# Building and Running

*   **Install dependencies:**
    ```bash
    npm install
    ```
*   **Run the development server:**
    ```bash
    npm run dev
    ```
*   **Build for production:**
    ```bash
    npm run build
    ```
*   **Lint the code:**
    ```bash
    npm run lint
    ```
*   **Preview the production build:**
    ```bash
    npm run preview
    ```

# Development Conventions

*   **Path Aliases:** The project uses the `@` alias for the `src` directory. For example, `import Component from '@/components/Component';`.
*   **Styling:** The project uses Tailwind CSS for styling. Utility classes should be used for styling components.
*   **Components:** The project seems to be using a component-based architecture. The `components.json` file and Radix UI dependencies suggest the use of `shadcn/ui` for components.
*   **Routing:** Routing is handled by `react-router`. New pages should be added to the `Routes` in `src/App.jsx`.
