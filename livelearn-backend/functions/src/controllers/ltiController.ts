import * as logger from "firebase-functions/logger";
import { Request, Response } from "express";
import { FieldValue } from "firebase-admin/firestore";

import { db } from "../config/firebaseConfig";
import { generateLtiConfigXml } from "../utils/generateLtiConfigXml";
import { 
  getInstructorRoles,
  getAssistantRoles,
  getObserverRoles,
  getClientIdAndSecret,
} from "../utils/LtiUtils";
import { livelearnDomain } from "../utils/constants";
import RequestHandler from "../utils/RequestHandler";

const requestHandler = new RequestHandler();

class LtiController {
  async launch(req: Request, res: Response) {
    logger.log("LTI launch request received");

    const {
      custom_canvas_course_id,
      custom_canvas_api_domain,
      context_title,
      roles,
    } = req.body;
    if (
      !custom_canvas_course_id ||
      !custom_canvas_api_domain ||
      !context_title ||
      !roles
    ) {
      return requestHandler.sendClientError(req, res, 'Missing required LTI parameters', 400);
    }

    try {
      const {clientId} = await getClientIdAndSecret(custom_canvas_api_domain);

      // Check user's role
      const rolesArray = roles.split(',');
      let role = "Learner";
      if (getObserverRoles().some((role) => rolesArray.includes(role))) {
        return requestHandler.sendClientError(req, res, "User is not a student", 401);
      }
      else if (getInstructorRoles().some((role) => rolesArray.includes(role))) {
        role = "Instructor";
      }
      else if (getAssistantRoles().some((role) => rolesArray.includes(role))) {
        role = "Assistant";
      }

      // Redirect to enable course if it does not exist
      const courseDoc = await db.collection("courses").doc(custom_canvas_course_id).get();
      if (!courseDoc.exists) {
        if (role !== "Instructor") {
          return requestHandler.sendClientError(req, res, "Instructor must enable the course", 401);
        }
        const paramsId = crypto.randomUUID();
        const paramsRef = db.collection('temp').doc(paramsId);
        await paramsRef.set({
          courseId: custom_canvas_course_id,
          courseName: context_title,
          createdAt: FieldValue.serverTimestamp(),
        });

        const canvasAuthUrl = `https://${custom_canvas_api_domain}/login/oauth2/auth`;
        const redirectUri = encodeURIComponent(`https://${livelearnDomain}/enableCourse`);
        // eslint-disable-next-line max-len
        return requestHandler.sendRedirect(res, `${canvasAuthUrl}?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&state=${paramsId}`);
      }

      // Course exists, return auth token to log in user
      const loginId = "temp";
      return requestHandler.sendRedirect(res, `https://${livelearnDomain}/login?id=${loginId}`);
    }
    catch (error) {
      return requestHandler.sendServerError(req, res, error);
    }
  }

  async getLtiConfig(req: Request, res: Response) {
    const xml = generateLtiConfigXml();
    res.set('Content-Type', 'application/xml');
    res.send(xml);
  }
}

export default LtiController;