/* eslint-disable require-jsdoc */
import * as logger from "firebase-functions/logger";
import {Request, Response} from "express";
import parseLinkHeader from "parse-link-header";

import {db} from "../config/firebaseConfig";
import {refreshAccessToken} from "./TokenHandler";

class RequestHandler {
  sendSuccess(res: Response, message?: string, status?: number) {
    logger.log(`A request has been made and proccessed successfully at: ${new Date()}`);

    return (data?: any, globalData?: any) => {
      if (!status) {
        status = 200;
      }
      res.status(status).json({
        type: "success",
        message: message || "Success result",
        data,
        ...globalData,
      });
    };
  }

  sendRedirect(res: Response, url: string) {
    logger.log(`A redirect has been made to ${url} at: ${new Date()}`);
    res.redirect(302, url);
  }

  sendClientError(req: Request, res: Response, message: string, status?: number) {
    const url = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    logger.log(`A request has been returned with client error: ${message}`, {url: url});

    return res.status(status || 400).json({
      type: "error",
      message: message,
    });
  }

  sendServerError(req: Request, res: Response, error: any) {
    const url = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    logger.error(error.message, {error: error, url: url});

    return res.status(error.status || 500).json({
      type: "error",
      message: error.message || "Unhandled server error",
    });
  }

  async sendCanvasRequest(method: string, domain: string, url: string,
    courseId: string, firstTry: boolean, data: any[] = []): Promise<any> {
    const courseRef = db.collection("courses").doc(courseId);
    const courseDoc = (await courseRef.get()).data();
    const token = courseDoc!.accessToken;
    const refreshToken = courseDoc!.refreshToken;

    const object = {
      method: method,
      headers: {
        "Authorization": `Bearer ${token}`,
        "accept": "application/json",
        "content-type": "application/json",
      },
    };
    const response = await fetch("https://" + domain + url, object);
    const json = await response.json();

    // Check for error, request new token after first failure
    if (json.errors) {
      if (!firstTry) {
        throw new Error(json.errors[0]?.message ?? JSON.stringify(json.errors));
      }
      await refreshAccessToken(refreshToken, courseId, domain);
      return this.sendCanvasRequest(method, domain, url, courseId, false);
    }
    // Check for pagination
    if (response.headers.get("link")) {
      const parsed = parseLinkHeader(response.headers.get("link"));
      if (parsed && parsed.next) {
        const parsedURL = parsed.next.url.substring(parsed.next.url.indexOf("/api"));
        data.push(...json);
        return this.sendCanvasRequest(method, domain, parsedURL, courseId, false, data);
      }
      data.push(...json);
      return data;
    }
    return json;
  }
}

export default RequestHandler;
