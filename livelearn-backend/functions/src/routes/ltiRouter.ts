import { Router } from "express";
import LtiController from "../controllers/ltiController";

const ltiRouter = Router();
const ltiController = new LtiController();

ltiRouter.post("/launch", (req, res) => ltiController.launch(req, res))

export default ltiRouter;