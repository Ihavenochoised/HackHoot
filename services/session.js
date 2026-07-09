//
// This file is responsible for exactly one thing:
// Setting up the session middleware for Express.
//

import session from 'express-session';
import Database from 'better-sqlite3';
import SQLiteStoreFactory from 'better-sqlite3-session-store';

import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const databaseDir = path.join(__dirname, 'database');
if (!fs.existsSync(databaseDir)) {
    fs.mkdirSync(databaseDir, { recursive: true });
}

const SQLiteStore = SQLiteStoreFactory(session);

const db = new Database(path.join(databaseDir, 'sessions.db'));

export const sessionMiddleware = session({
    store: new SQLiteStore({
        client: db,
    }),

    secret: process.env.SESSION_SECRET || 'supersecretsessionsecret!@#$%^&*()',

    resave: false,
    saveUninitialized: false,

    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
});
