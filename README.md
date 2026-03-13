# Splitgather

## Getting Started

Before running the project, open your **terminal** and navigate to the **project folder** (the folder that contains `package.json`).

Example:

```bash
cd path/to/splitgather
```

Example on Windows:

```bash
cd C:\Users\YourName\Documents\splitgather
```

Example on Mac/Linux:

```bash
cd ~/Documents/splitgather
```

You should see files like `package.json`, `apps`, or `docs` in this folder if you run the `ls` command.

---

## First Time Setup

If this is the first time running the application, you need to install dependencies and set up the database:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create the database:**
   ```bash
   npm run db:migrate --workspace=api
   ```

After completing these steps, you can proceed to run the application.

---

## Run Both Backend and Frontend

To start **both the Backend API and the Frontend together**, run:

```bash
npm run dev
```

---

## Run Only the Backend API

If you only want to run the **backend server**, use:

```bash
npm run dev:api
```

---

## Run Only the Frontend

If you only want to run the **frontend app**, use:

```bash
npm run dev:web
```

---

✅ **Tip:** Always run these commands from the **root project directory** (the folder that contains `package.json`).

---