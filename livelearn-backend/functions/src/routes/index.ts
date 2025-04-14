import {Router} from "express";
import ltiRouter from "./ltiRouter";
import canvasRouter from "./canvasRouter";

// eslint-disable-next-line new-cap
const router = Router();
router.use("/lti", ltiRouter);
router.use("/canvas", canvasRouter);

export default router;
