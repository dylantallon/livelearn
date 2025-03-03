import { Router } from "express";
import LtiController from "../controllers/ltiController";

const ltiRouter = Router();
const ltiController = new LtiController();

ltiRouter.post("/launch", (req, res) => ltiController.launch(req, res));

ltiRouter.get("/config", (req, res) => ltiController.getLtiConfig(req, res));

ltiRouter.post("/enableCourse", (req, res) => ltiController.enableCourse(req, res));

export default ltiRouter;