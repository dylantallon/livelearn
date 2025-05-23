/* eslint-disable require-jsdoc */
import * as logger from "firebase-functions/logger";
import {Request, Response} from "express";

import {db} from "../config/firebaseConfig";
import {getCanvasId} from "../utils/LtiUtils";
import RequestHandler from "../utils/RequestHandler";

const requestHandler = new RequestHandler();

class CanvasController {
  async gradeAssignment(req: Request, res: Response) {
    const {pollId} = req.body;
    logger.log("Grade assignment request received", pollId);

    // Check if required parameters are present in request body
    if (!pollId) {
      return requestHandler.sendClientError(req, res, "Missing required parameters", 400);
    }

    try {
      // Retrieve poll information and scores
      const pollDoc = await db.collection("polls").doc(pollId).get();
      const pollData = pollDoc.data();
      if (!pollData) {
        return requestHandler.sendClientError(req, res, "Poll ID does not exist", 400);
      }
      const scores = await pollDoc.ref.collection("scores").get();
      if (scores.size === 0) {
        return requestHandler.sendClientError(req, res, "Poll does not have any scores", 400);
      }
      const canvasCourseId = getCanvasId(pollData.courseId);

      let lineItemId = pollData.assignmentId;
      // Check if assignment exists in Canvas
      if (lineItemId) {
        try {
          await requestHandler.sendCanvasRequest(
            `/api/lti/courses/${canvasCourseId}/line_items/${lineItemId}`,
            "GET", pollData.courseId, true, true,
          );
        }
        catch (error) {
          if (error instanceof Error && !error.message.includes("unauthorized")) {
            lineItemId = null;
          }
        }
      }
      // Create assignment if it does not exist
      if (!lineItemId) {
        // Create assignment in category via API
        // const courseDoc = await db.collection("courses").doc(pollData.courseId).get();
        // const assignmentGroupId = courseDoc.data()!.assignmentCategory;
        // let params1 = `assignment[name]=${pollData.title}`;
        // params1 += `&assignment[assignment_group_id]=${assignmentGroupId}`;
        // params1 += `&assignment[points_possible]=${pollData.points}`;
        // await requestHandler.sendCanvasRequest(
        //   `/api/v1/courses/${canvasCourseId}/assignments?${params1}`,
        //   "POST", pollData.courseId, false, true,
        // );
        // Create corresponding line item via AGS
        const params2 = `label=${pollData.title}&scoreMaximum=${pollData.points}`;
        const response = await requestHandler.sendCanvasRequest(
          `/api/lti/courses/${canvasCourseId}/line_items?${params2}`,
          "POST", pollData.courseId, true, true,
        );
        // Update poll with assignment Id
        lineItemId = response.id.substring(response.id.lastIndexOf("/") + 1);
        await pollDoc.ref.update({assignmentId: lineItemId});
      }

      // Grade assignment for each student via AGS
      const timestamp = new Date().toISOString();
      for (const scoreDoc of scores.docs) {
        let params = `userId=${getCanvasId(scoreDoc.id)}&timestamp=${timestamp}`;
        params += "&activityProgress=Completed&gradingProgress=FullyGraded";
        params += `&scoreGiven=${scoreDoc.data().points}&scoreMaximum=${pollData.points}`;
        await requestHandler.sendCanvasRequest(
          `/api/lti/courses/${canvasCourseId}/line_items/${lineItemId}/scores?${params}`,
          "POST", pollData.courseId, true, true,
        );
      }

      return requestHandler.sendSuccess(res)("Assignment graded");
    }
    catch (error) {
      return requestHandler.sendServerError(req, res, error);
    }
  }
}

export default CanvasController;
