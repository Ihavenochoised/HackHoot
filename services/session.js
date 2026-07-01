//
// This file is responsible for exactly one thing:
// Setting up the session middleware for Express.
//

import session from 'express-session';
import Database from 'better-sqlite3';
import SQLiteStoreFactory from 'better-sqlite3-session-store';

const SQLiteStore = SQLiteStoreFactory(session);

const db = new Database('./database/sessions.db');

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
