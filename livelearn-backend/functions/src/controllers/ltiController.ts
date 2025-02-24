import * as logger from "firebase-functions/logger";
import { Request, Response } from "express";

import RequestHandler from "../utils/RequestHandler";

const requestHandler = new RequestHandler();

class LtiController {
  async launch(req: Request, res: Response) {
    logger.log("LTI launch request received");
    return requestHandler.sendSuccess(res)({success: true});
  }
}

export default LtiController;