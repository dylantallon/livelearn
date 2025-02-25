import * as logger from "firebase-functions/logger";
import { Request, Response } from "express";

import { generateLtiConfigXml } from "../utils/generateLtiConfigXml";
import RequestHandler from "../utils/RequestHandler";

const requestHandler = new RequestHandler();

class LtiController {
  async launch(req: Request, res: Response) {
    logger.log("LTI launch request received");
    return requestHandler.sendSuccess(res)({success: true});
  }

  async getLtiConfig(req: Request, res: Response) {
    const xml = generateLtiConfigXml();
    res.set('Content-Type', 'application/xml');
    res.send(xml);
  }
}

export default LtiController;