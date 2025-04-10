import {Router} from "express";
import CanvasController from "../controllers/canvasController";

// eslint-disable-next-line new-cap
const canvasRouter = Router();
const canvasController = new CanvasController();

canvasRouter.post("/assignments", canvasController.createAssignment);

export default canvasRouter;
