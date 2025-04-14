import {Router} from "express";
import LtiController from "../controllers/ltiController";

// eslint-disable-next-line new-cap
const ltiRouter = Router();
const ltiController = new LtiController();

ltiRouter.post("/initiation", (req, res) => ltiController.initiation(req, res));

ltiRouter.post("/launch", (req, res) => ltiController.launch(req, res));

ltiRouter.get("/config", (req, res) => ltiController.getLtiConfig(req, res));

ltiRouter.get("/enableCourse", (req, res) => ltiController.enableCourse(req, res));

export default ltiRouter;
