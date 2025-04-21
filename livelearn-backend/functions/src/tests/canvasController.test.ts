import request from "supertest";

import {db} from "../config/firebaseConfig";
import {app} from "..";
import {test} from "./setup";
import RequestHandler from "../utils/RequestHandler";

// Mock requests to Canvas API
const canvasSpy = jest.spyOn(RequestHandler.prototype, "sendCanvasRequest");

describe("POST /assignments", () => {
  afterAll(() => {
    test.cleanup();
  });
  afterEach(() => {
    canvasSpy.mockReset();
  });

  it("should return 400 with missing parameters", async () => {
    const res = await request(app).post("/v1/canvas/assignments");
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Missing required parameters");
  });

  it("should return 400 with nonexistent poll", async () => {
    const res = await request(app)
      .post("/v1/canvas/assignments")
      .send({pollId: "testPollId"})
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Poll ID does not exist");
  });

  it("should return 400 with nonexistent scores", async () => {
    // Create poll in Firebase
    const pollRef = db.collection("polls").doc("testPollId");
    await pollRef.create({
      courseId: "000ufldev",
      title: "Test Poll",
      points: 10,
    });

    const res = await request(app)
      .post("/v1/canvas/assignments")
      .send({pollId: "testPollId"})
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Poll does not have any scores");

    await pollRef.delete();
  });

  it("should grade poll successfully with existing assignment", async () => {
    // Create poll with scores in Firebase
    const pollRef = db.collection("polls").doc("testPollId");
    await pollRef.create({
      courseId: "000ufldev",
      assignmentId: "testAssignmentId",
      title: "Test Poll",
      points: 10,
    });
    await pollRef.collection("scores").doc("001ufldev").create({points: 5});
    await pollRef.collection("scores").doc("002ufldev").create({points: 10});
    await pollRef.collection("scores").doc("003ufldev").create({points: 0});

    canvasSpy.mockImplementation(() => Promise.resolve("Success message"));
    const res = await request(app)
      .post("/v1/canvas/assignments")
      .send({pollId: "testPollId"})
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");
    expect(res.status).toBe(200);
    // Call spy 1 time to get assignment and 3 times to grade assignment
    expect(canvasSpy).toHaveBeenCalledTimes(4);

    await pollRef.collection("scores").doc("001ufldev").delete();
    await pollRef.collection("scores").doc("002ufldev").delete();
    await pollRef.collection("scores").doc("003ufldev").delete();
    await pollRef.delete();
  });

  it("should grade poll successfully without existing assignment", async () => {
    // Create poll with scores in Firebase
    const pollRef = db.collection("polls").doc("testPollId");
    await pollRef.create({
      courseId: "000ufldev",
      title: "Test Poll",
      points: 10,
    });
    await pollRef.collection("scores").doc("001ufldev").create({points: 5});
    await pollRef.collection("scores").doc("002ufldev").create({points: 10});
    await pollRef.collection("scores").doc("003ufldev").create({points: 0});

    canvasSpy.mockImplementation(() => Promise.resolve({
      id: "https://ufldev.instructure.com/line_items/testAssignmentId",
    }));
    const res = await request(app)
      .post("/v1/canvas/assignments")
      .send({pollId: "testPollId"})
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");
    expect(res.status).toBe(200);
    // Call spy 1 time to create assignment and 3 times to grade assignment
    expect(canvasSpy).toHaveBeenCalledTimes(4);
    // Assert that poll was updated with new assignment Id
    const pollData = await pollRef.get();
    expect(pollData.data()!.assignmentId).toEqual("testAssignmentId");

    await pollRef.collection("scores").doc("001ufldev").delete();
    await pollRef.collection("scores").doc("002ufldev").delete();
    await pollRef.collection("scores").doc("003ufldev").delete();
    await pollRef.delete();
  });
});

