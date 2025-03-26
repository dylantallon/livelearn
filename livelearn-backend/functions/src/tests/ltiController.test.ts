import request from "supertest";
import {app} from "..";
import {test} from "./setup";

describe("LTI launch", () => {
  afterAll(() => {
    test.cleanup();
  });

  it("should return 400 with missing parameters", async () => {
    const res = await request(app).post("/v1/lti/launch");
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Missing required LTI parameters");
  });

  it("should redirect to app if course and user exist", async () => {
    const res = await request(app)
      .post("/v1/lti/launch")
      .send({
        custom_canvas_course_id: "206",
        custom_canvas_user_id: "133",
        custom_canvas_api_domain: "ufldev.instructure.com",
        context_title: "LiveLearn Test Course",
        roles: "Learner",
      })
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain("https://livelearn-fe28b.web.app?token=");
  });

  it("should return 401 if course doesn't exist and user isn't instructor", async () => {
    const res = await request(app)
      .post("/v1/lti/launch")
      .send({
        custom_canvas_course_id: "000",
        custom_canvas_user_id: "133",
        custom_canvas_api_domain: "ufldev.instructure.com",
        context_title: "Jest Test Course",
        roles: "Learner",
      })
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message", "Instructor must enable the course");
  });

  it("should redirect to Canvas auth if course doesn't exist and user is instructor", async () => {
    const res = await request(app)
      .post("/v1/lti/launch")
      .send({
        custom_canvas_course_id: "000",
        custom_canvas_user_id: "133",
        custom_canvas_api_domain: "ufldev.instructure.com",
        context_title: "Jest Test Course",
        roles: "Instructor",
      })
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain("https://ufldev.instructure.com/login/oauth2/auth");
  });
});
