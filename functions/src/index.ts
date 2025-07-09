/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/v2/https";
import {initializeApp} from "firebase-admin/app";
import express from "express";
import cors from "cors";
import {verifyAuth} from "./middleware/auth";
import {familyMembersRouter} from "./routes/familyMembers";
import {restaurantsRouter} from "./routes/restaurants";

// Initialize Firebase Admin
initializeApp();

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({maxInstances: 10});

const app = express();

app.use(cors({origin: true}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({success: true, message: 'API is running'});
});

// Protected routes
app.use('/api/family-members', verifyAuth, familyMembersRouter);
app.use('/api/restaurants', verifyAuth, restaurantsRouter);

export const api = onRequest({maxInstances: 10}, app);
