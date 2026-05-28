# Expense Tracker Backend

This is the backend for the personal expense tracker application.

## Setup

1.  **Install Node.js and npm/yarn:** If you don't have them installed, download from [nodejs.org](https://nodejs.org/).
2.  **Install PostgreSQL:** Download and install PostgreSQL from [postgresql.org](https://www.postgresql.org/). Create a database named `expense_tracker` (or update `.env.example`).
3.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd expense-tracker/backend
    ```
4.  **Install dependencies:**
    ```bash
    npm install
    ```
5.  **Configure environment variables:**
    Copy `.env.example` to `.env` and fill in your database credentials and a JWT secret.
    ```bash
    cp .env.example .env
    # Edit .env file
    ```
6.  **Initialize Database:** Run the setup script or manually create the `users` table if it doesn't exist.
    ```sql
    -- Example SQL to create the users table (run in your PostgreSQL client)
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ```

## Running the Server

*   **Development:**
    ```bash
    npm run dev
    ```
    This will start the server with nodemon, which automatically restarts on file changes.

*   **Production:**
    ```bash
    npm start
    ```

## Running Tests

```bash
    npm test
    ```
