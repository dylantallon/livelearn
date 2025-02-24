import { Router } from "express";
import ltiRouter from "./ltiRouter";

const router = Router();
router.use("/lti", ltiRouter);

export default router;
