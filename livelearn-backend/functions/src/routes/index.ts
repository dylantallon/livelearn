import {Router} from "express";
import ltiRouter from "./ltiRouter";

// eslint-disable-next-line new-cap
const router = Router();
router.use("/lti", ltiRouter);

export default router;
