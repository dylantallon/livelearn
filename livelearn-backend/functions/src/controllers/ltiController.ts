/* eslint-disable require-jsdoc */
import * as logger from "firebase-functions/logger";
import {Request, Response} from "express";
import {FieldValue} from "firebase-admin/firestore";
import {getAuth} from "firebase-admin/auth";

import {db} from "../config/firebaseConfig";
import {generateLtiConfigXml} from "../utils/generateLtiConfigXml";
import {
  getInstructorRoles,
  getAssistantRoles,
  getObserverRoles,
  getClientIdAndSecret,
} from "../utils/LtiUtils";
import {livelearnDomain} from "../utils/constants";
import {requestAccessToken} from "../utils/TokenHandler";
import RequestHandler from "../utils/RequestHandler";

const requestHandler = new RequestHandler();

class LtiController {
  async launch(req: Request, res: Response) {
    logger.log("LTI launch request received");

    const {
      custom_canvas_course_id,
      custom_canvas_user_id,
      custom_canvas_api_domain,
      context_title,
      roles,
    } = req.body;
    if (
      !custom_canvas_course_id ||
      !custom_canvas_user_id ||
      !custom_canvas_api_domain ||
      !context_title ||
      !roles
    ) {
      return requestHandler.sendClientError(req, res, "Missing required LTI parameters", 400);
    }

    try {
      const canvasURL = custom_canvas_api_domain;
      const {clientId} = await getClientIdAndSecret(canvasURL);
      const canvasDomain = canvasURL.substring(0, canvasURL.indexOf("."));
      const userId = custom_canvas_user_id + canvasDomain;
      const courseId = custom_canvas_course_id + canvasDomain;

      // Check user's role
      const rolesArray = roles.split(",");
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
      const courseDoc = await db.collection("courses").doc(courseId).get();
      if (!courseDoc.exists) {
        if (role !== "Instructor") {
          return requestHandler.sendClientError(req, res, "Instructor must enable the course", 401);
        }
        const paramsId = crypto.randomUUID();
        const paramsRef = db.collection("temp").doc(paramsId);
        await paramsRef.set({
          courseId: courseId,
          courseName: context_title,
          userId: userId,
          createdAt: FieldValue.serverTimestamp(),
        });

        const canvasAuthUrl = `https://${custom_canvas_api_domain}/login/oauth2/auth`;
        const redirectUri = encodeURIComponent(`https://${livelearnDomain}/enableCourse`);
        // eslint-disable-next-line max-len
        return requestHandler.sendRedirect(res, `${canvasAuthUrl}?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&state=${paramsId}`);
      }

      // Course exists, update course details
      const updatedCourse: any = {};
      if (courseDoc.data()!.name !== context_title) {
        updatedCourse.name = context_title;
      }
      if (role === "Instructor" && !courseDoc.data()!.instructors.includes(userId)) {
        updatedCourse.instructors = FieldValue.arrayUnion(userId);
      }
      else if (courseDoc.data()!.instructors.includes(userId) && role !== "Instructor") {
        updatedCourse.instructors = FieldValue.arrayRemove(userId);
      }
      if (Object.keys(updatedCourse).length) {
        await courseDoc.ref.update(updatedCourse);
      }

      // Return auth token to log in user
      const loginId = await getAuth().createCustomToken(userId);
      return requestHandler.sendRedirect(res, `https://${livelearnDomain}?token=${loginId}`);
    }
    catch (error) {
      return requestHandler.sendServerError(req, res, error);
    }
  }

  async getLtiConfig(req: Request, res: Response) {
    const xml = generateLtiConfigXml();
    res.set("Content-Type", "application/xml");
    res.send(xml);
  }

  async enableCourse(req: Request, res: Response) {
    try {
      const {code, state} = req.body;
      const paramsRef = db.collection("temp").doc(state);
      const paramsDoc = await paramsRef.get();
      const courseId = paramsDoc.data()?.courseId;
      const courseName = paramsDoc.data()?.courseName;
      const userId = paramsDoc.data()?.userId;

      logger.log("Enable course request received", courseId);

      // Check if required parameters are present in request body
      if (!courseId || !courseName || !userId || !code) {
        return requestHandler.sendClientError(req, res, "Missing required parameters", 400);
      }

      // Generate instructor"s Canvas tokens for this course
      const firstLetter = userId.search(/[A-Z]/i);
      const canvasURL = `${userId.substring(firstLetter)}.instructure.com`;
      const tokenResponse = await requestAccessToken(code, canvasURL);
      const token = tokenResponse.access_token;
      const refreshToken = tokenResponse.refresh_token;
      if (!token || !refreshToken) {
        return requestHandler.sendClientError(req, res, "Invalid LTI tokens", 400);
      }

      // Create course on Firebase
      const courseRef = db.collection("courses").doc(courseId);
      await courseRef.set({
        courseId: courseId,
        courseName: courseName,
        token: token,
        refreshToken: refreshToken,
        updatedAt: FieldValue.serverTimestamp(),
      });
      await paramsRef.delete();

      // Return auth token to log in user
      const loginId = await getAuth().createCustomToken(userId);
      return requestHandler.sendRedirect(res, `https://${livelearnDomain}/login?id=${loginId}`);
    }
    catch (error) {
      return requestHandler.sendServerError(req, res, error);
    }
  }
}

export default LtiController;
