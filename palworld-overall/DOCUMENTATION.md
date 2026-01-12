# Palworld Overall Documentation

This document provides an overview of the Palworld Overall project, explaining its purpose, architecture, and how it works.

## Purpose

The Palworld Overall project is a web-based tool designed to help players of the game Palworld determine the optimal set of "passive skills" for their Pals. It provides recommendations for two primary builds:

*   **Combat Build:** Focused on maximizing a Pal's damage output.
*   **Movement Build:** Focused on enhancing a Pal's speed and efficiency as a mount.

The tool displays this information in a sortable and filterable table, allowing users to quickly find the best builds for their needs.

## Architecture

The project consists of two main components:

1.  **A Data Generation Pipeline (Node.js)**
2.  **A Static Web Frontend (HTML, CSS, vanilla JS)**

### Data Generation Pipeline

The data pipeline is responsible for processing raw Pal data and generating the JSON files that power the frontend.

*   **`parse_pals.js`**: This is the central script of the pipeline. It reads a hardcoded string of Pal data, processes it, and applies the logic to generate the final output.
*   **`pal_types.js`**: This file acts as a configuration map, defining whether each Pal is a "fighter" or a "mount". This information is crucial for determining which passive skill logic to apply.
*   **`pal_passives_logic.js`**: This file contains the core business logic. It implements a rule-based system to calculate the optimal set of four passive skills for both combat and movement builds based on a Pal's type and elemental attributes.
*   **Output Files**:
    *   `pals_raw.json`: A structured JSON file containing detailed information for each Pal, including its base stats and all calculated passive skill sets. This is used for the modal/detail view.
    *   `pals.json`: A flattened, simplified JSON file designed for easy rendering in the main HTML table.

The pipeline is executed manually by running `node parse_pals.js`.

### Frontend

The frontend is a single-page application that displays the generated data.

*   **`server.js`**: A minimal Express.js server that serves the static assets of the application (HTML, JSON, images).
*   **`app.html`**: The main entry point for the user. It contains the complete HTML structure, CSS for styling, and all the client-side JavaScript for interactivity.
*   **Client-Side Logic (in `app.html`)**: The JavaScript code within `app.html` is responsible for:
    *   Fetching `pals.json` and `pals_raw.json` on page load.
    *   Rendering the data into an HTML table.
    *   Handling user interactions like sorting the table by different columns and filtering the Pals shown.
    *   Displaying a detailed modal view when a user clicks on a Pal in the table.
