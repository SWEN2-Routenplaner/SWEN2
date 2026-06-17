# TourPlanner Protocol

This document provides a summary of the technical decisions, features, and UI-flow for the TourPlanner project.

https://github.com/SWEN2-Routenplaner/SWEN2

## Technical Steps and Decisions

### Architecture & Frameworks
- **Frontend Framework:** Angular (v21) was selected for its robust component-based architecture and modern features like Signals.
- **State Management:** A custom Signal-based store was implemented (e.g., `ToursStore`, `AuthStore`). This provides a reactive way to manage state without the complexity of NgRx.
- **Testing:** `vitest` is used for unit testing, offering better performance and integration with modern JavaScript features compared to Karma.
- **Styling:** Tailwind CSS was integrated for utility-first styling, enabling rapid UI development.

### Design Decisions & Refactoring
- **Routing Structure:** Refactored from a flat structure to a hierarchical one with child routes under `/tours`. This allows for better organization of nested views like tour logs and editing.
- **Folder Organization:** The `tours` component directory was refactored to nest sub-components like `new-tour` and `saved-tours` within a `default` component for better encapsulation.
- **Navbar Refactoring:** The search bar was moved into a separate component to keep the navbar lean and improve modularity.
- **Mobile Support:** Implemented a responsive mobile navigation system to enhance accessibility on small screens.

### Failures and Selected Solutions
- **Invalid Route Access:** Encountered issues when users manually entered URLs for non-existent tour logs. 
    - *Solution:* Implemented guard-like logic in components to redirect users if a resource ID (e.g., `logId`) is not found.
- **Form State Management:** Initial tour creation forms were complex and hard to validate across many fields.
    - *Solution:* Standardized on Angular Reactive Forms with clear validation messages and visual feedback (e.g., changing colors for transport modes).
- **Navigation Complexity:** As more features were added, the navbar became cluttered.
    - *Solution:* Extracted the search feature into its own component and introduced a dedicated mobile navigation view.

## UML Use Case Diagram

![Use Case Diagram](use-case.png)

See [use-case.puml](./use-case.puml) for the PlantUML source.

## UI-Flow (Wireframes)

The following flow describes the typical user interaction path:

### 1. Authentication Flow
- **Register/Login Page:** User enters credentials.
- **Success:** Redirects to **Home**.

### 2. Main Navigation
- **Navbar:** Provides links to **Home**, **Tours**, and **Profile**.
- **Search Bar:** Integrated into the Navbar for global tour searching.

### 3. Tour Management Flow
- **Home:** Overview and quick links.
- **Tours (Default View):** Shows a list of **Saved Tours** on the left and a **New Tour** form or selected tour details on the right.
- **New Tour:** Form with fields for `From`, `To`, `Transport Mode`, and `Description`. Includes ability to add intermediate stops.
- **Edit Tour:** Opens an edit form for an existing tour.

### 4. Log Management Flow
- **Saved Tour Item:** Click to view logs.
- **Tour Logs View:** Shows a list of logs for the selected tour.
- **Add/Edit Log:** Modal or sub-page to enter log details (date, duration, distance, etc.).

### Wireframe
![Wireframe](wireframe.png)

### Authentication (Authentik)
A functional integration between the Spring Boot backend and Authentik (OIDC) has been established. 

**Critical Integration Note (Spring Boot 3.2+ / Java 21):**
During the initial setup, the token exchange phase repeatedly failed with `invalid_token_response`, `unsupported_grant_type`, and `invalid_grant` errors. 

**Root Cause:**
1.  **Java 21 HTTP Client Incompatibility:** Spring Boot 3.2+ uses a new `JdkClientHttpRequestFactory` by default. Authentik's internal web server (Gunicorn) rejects the token POST requests made by this new client as malformed (`Invalid HTTP request received`).
2.  **Redirect Body Drops:** If the provider URLs in `application.properties` do not explicitly include trailing slashes (e.g., `/token` instead of `/token/`), Authentik issues a 301 redirect. This redirect causes the Java HTTP client to drop the POST body (containing the `grant_type`), leading to an `unsupported_grant_type` error.

**Solution Applied:**
*   **Trailing Slashes:** All `spring.security.oauth2.client.provider` URIs must explicitly match Authentik's discovery metadata, including trailing slashes.
*   **Custom RestClient:** The `SecurityConfig.java` was updated to explicitly override the `OAuth2AccessTokenResponseClient`. It now uses a custom `RestClient` backed by the classic `SimpleClientHttpRequestFactory`. This forces Spring to use standard HTTP/1.1 requests, which Authentik's router correctly parses. 
*   **Message Converters:** The custom `RestClient` must explicitly register `FormHttpMessageConverter` and `OAuth2AccessTokenResponseHttpMessageConverter` to prevent internal `NullPointerExceptions` during JSON parsing.

## Current Project State
The project currently has a functional frontend with state management for tours and authentication. The backend is in its initial setup phase with a basic Spring Boot application.
