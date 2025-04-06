/* eslint-disable require-jsdoc */
import * as logger from "firebase-functions/logger";
import {Request, Response} from "express";
import {FieldValue} from "firebase-admin/firestore";
import {getAuth} from "firebase-admin/auth";
import {decode, verify} from "jsonwebtoken";
import jwkToBuffer from "jwk-to-pem";

import {db} from "../config/firebaseConfig";
import {generateLtiConfigJson} from "../utils/generateLtiConfig";
import {
  getInstructorRoles,
  getAssistantRoles,
  getObserverRoles,
} from "../utils/LtiUtils";
import {livelearnDomain, redirectUri} from "../utils/constants";
import {requestAccessToken} from "../utils/TokenHandler";
import RequestHandler from "../utils/RequestHandler";

const requestHandler = new RequestHandler();

interface canvasPayload {
  "https://purl.imsglobal.org/spec/lti/claim/context": {
    title: string,
  }
  "https://purl.imsglobal.org/spec/lti/claim/roles": string[],
}

class LtiController {
  async initiation(req: Request, res: Response) {
    logger.log("LTI initiation request received");

    const {iss, login_hint, target_link_uri, client_id, lti_message_hint} = req.body;
    if (!iss || !login_hint || !target_link_uri || !client_id || !lti_message_hint) {
      return requestHandler.sendClientError(req, res, "Missing required LTI parameters", 400);
    }

    try {
      // Create temporary document to verify state
      const paramsId = crypto.randomUUID();
      const paramsRef = db.collection("temp").doc(paramsId);
      await paramsRef.set({
        iss: iss,
        clientID: client_id,
        createdAt: FieldValue.serverTimestamp(),
      });

      // Redirect to the Canvas auth URL to authorize the launch request
      const authUrl = "https://sso.canvaslms.com/api/lti/authorize_redirect";
      let params = `scope=openid&response_type=id_token&client_id=${client_id}&prompt=none`;
      params += `&redirect_uri=${redirectUri}&login_hint=${login_hint}&state=${paramsId}`;
      params += `&response_mode=form_post&nonce=${paramsId}&lti_message_hint=${lti_message_hint}`;
      return requestHandler.sendRedirect(res, `${authUrl}?${params}`);
    }
    catch (error) {
      return requestHandler.sendServerError(req, res, error);
    }
  }

  async launch(req: Request, res: Response) {
    logger.log("LTI launch request received");

    try {
      // Verify state
      const paramsDoc = await db.collection("temp").doc(req.body.state).get();
      const data = paramsDoc.data();
      if (!data || !data.iss || !data.clientID) {
        return requestHandler.sendClientError(req, res, "Invalid LTI token", 401);
      }
      await paramsDoc.ref.delete();

      // Fetch public JWK from Canvas to verify JWT
      const decodedJWT = decode(req.body.id_token, {complete: true});
      const response = await fetch("https://sso.canvaslms.com/api/lti/security/jwks");
      const canvasJWK = await response.json();
      const matchingKey = canvasJWK.keys.find((key: any) => key.kid === decodedJWT?.header.kid);
      verify(req.body.id_token, jwkToBuffer(matchingKey), {
        audience: data.clientID,
        issuer: data.iss,
      });

      // Extract claims from payload
      const payload = decodedJWT?.payload as canvasPayload;
      const context_title = payload["https://purl.imsglobal.org/spec/lti/claim/context"].title;
      const roles = payload["https://purl.imsglobal.org/spec/lti/claim/roles"];
      const course_id = "206";
      const user_id = "133";
      const api_domain = "ufldev.instructure.com";
      if (!course_id || !user_id || !api_domain || !context_title || !roles) {
        return requestHandler.sendClientError(req, res, "Missing required LTI parameters", 400);
      }

      const canvasDomain = api_domain.substring(0, api_domain.indexOf("."));
      const userId = user_id + canvasDomain;
      const courseId = course_id + canvasDomain;

      // Check user's role
      let role = "Learner";
      if (getObserverRoles().some((role) => roles.includes(role))) {
        return requestHandler.sendClientError(req, res, "User is not a student", 401);
      }
      else if (getInstructorRoles().some((role) => roles.includes(role))) {
        role = "Instructor";
      }
      else if (getAssistantRoles().some((role) => roles.includes(role))) {
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

        const redirectUri = encodeURIComponent(`https://${livelearnDomain}/enableCourse`);
        return requestHandler.sendRedirect(res, `${redirectUri}?state=${paramsId}`);
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
      const loginId = await getAuth().createCustomToken(userId, {
        courseId: courseId,
        role: role,
      });
      return requestHandler.sendRedirect(res, `https://${livelearnDomain}?token=${loginId}`);
    }
    catch (error) {
      return requestHandler.sendServerError(req, res, error);
    }
  }

  async getLtiConfig(req: Request, res: Response) {
    res.set("Content-Type", "application/json");
    res.send(generateLtiConfigJson());
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
      const loginId = await getAuth().createCustomToken(userId, {
        courseId: courseId,
        role: "Instructor",
      });
      return requestHandler.sendRedirect(res, `https://${livelearnDomain}?token=${loginId}`);
    }
    catch (error) {
      return requestHandler.sendServerError(req, res, error);
    }
  }
}

export default LtiController;
