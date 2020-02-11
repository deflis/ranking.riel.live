import * as functions from "firebase-functions";
import * as express from "express";
import narouRoute from "./routes/narou";

const app = express();

app.use("/api", narouRoute);

export const api = functions.https.onRequest(app);
