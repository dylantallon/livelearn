import express from "express";
import cors from "cors";
import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

import router from "./routes";

const port = 5000;
const app = express();

// Set up middleware to parse incoming request body
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cors());

process.on("SIGINT", () => {
  logger.log("Stopping the server");
  process.exit();
});

app.use((req, res, next) => {
  const logString = `${req.url} ${req.headers['user-agent']} ${JSON.stringify(req.body)}`;
  logger.log(`A request has been made: ${logString}`);
  next();
});

app.use("/api/v1", router);

app.use((req, res) => {
  logger.warn(`Client tried to access unknown url ${req.url}`);
  res.status(404).json({
    type: "error",
    message: "The URL you are trying to reach is not hosted on our server",
  });
});

app.listen(port, () => {
  logger.log(`The server started listening on port ${port}`);
});

export const api = onRequest(app);
