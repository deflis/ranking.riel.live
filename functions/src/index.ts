import * as functions from "firebase-functions";
import * as express from "express";
import apiRoute from "./routes/api";
import detailRoute from "./routes/detail";

const app = express();
app.set("view engine", "ejs");
app.use("/api", apiRoute);
app.use("/_api", apiRoute);
app.use("/detail", detailRoute);

export const api = functions.https.onRequest(app);
