import * as logger from "firebase-functions/logger";
import {Request, Response} from "express";
import parseLinkHeader from "parse-link-header";

import {db} from "../config/firebaseConfig";
import {refreshAccessToken, requestAGSToken} from "./TokenHandler";

/**
 * Class for handling requests
 */
class RequestHandler {
  /**
   * Returns HTTP success to client
   * @param {Response} res
   * @param {string} message
   * @param {number} status
   * @return {Response}
   */
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

  /**
 * Redirects the client to a new URL
 * @param {Response} res
 * @param {string} url
 */
  sendRedirect(res: Response, url: string) {
    logger.log(`A redirect has been made to ${url} at: ${new Date()}`);
    res.redirect(302, url);
  }

  /**
 * Returns HTTP failure due to client error
 * @param {Request} req
 * @param {Response} res
 * @param {string} message
 * @param {number} status
 * @return {Response}
 */
  sendClientError(req: Request, res: Response, message: string, status?: number) {
    const url = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    logger.log(`A request has been returned with client error: ${message}`, {url: url});

    return res.status(status || 400).json({
      type: "error",
      message: message,
    });
  }

  /**
 * Returns HTTP failure due to server error
 * @param {Request} req
 * @param {Response} res
 * @param {any} error
 * @return {Response}
 */
  sendServerError(req: Request, res: Response, error: any) {
    const url = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    logger.error(error.message, {error: error, url: url});

    return res.status(error.status || 500).json({
      type: "error",
      message: error.message || "Unhandled server error",
    });
  }

  /**
 * Sends HTTP request to the Canvas API
 * @param {string} url - Canvas API endpoint
 * @param {string} method - HTTP method to use
 * @param {string} courseId - ID of course initiating request
 * @param {boolean} isAGS - True if accessing Assignment Grading Services
 * @param {boolean} firstTry - True if first try accessing API (before refreshing token)
 * @param {any[]} data - Data from previous pages if the method is being called recursively
 * @return {Promise<any>}
 */
  async sendCanvasRequest(url: string, method: string, courseId: string,
    isAGS: boolean, firstTry: boolean, data: any[] = []): Promise<any> {
    const courseRef = db.collection("courses").doc(courseId);
    const courseDoc = (await courseRef.get()).data();
    const token = isAGS ? courseDoc!.agsToken : courseDoc!.accessToken;
    const refreshToken = courseDoc!.refreshToken;

    const domain = courseId.substring(courseId.search(/[A-Z]/i)) + ".instructure.com";
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
      if (isAGS) {
        await requestAGSToken(courseId, domain);
      }
      else {
        await refreshAccessToken(refreshToken, courseId, domain);
      }
      return this.sendCanvasRequest(method, url, courseId, isAGS, false);
    }
    // Check for pagination
    if (response.headers.get("link")) {
      const parsed = parseLinkHeader(response.headers.get("link"));
      data.push(...json);
      if (parsed && parsed.next) {
        const parsedURL = parsed.next.url.substring(parsed.next.url.indexOf("/api"));
        return this.sendCanvasRequest(method, parsedURL, courseId, isAGS, false, data);
      }
      return data;
    }
    return json;
  }
}

export default RequestHandler;
