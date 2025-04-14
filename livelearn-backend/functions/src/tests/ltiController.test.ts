import request from "supertest";
import {decode} from "jsonwebtoken";

import {db} from "../config/firebaseConfig";
import {app} from "..";
import {test} from "./setup";

// Mock JWT to return test data when decoded and to ignore verification
jest.mock("jwk-to-pem");
jest.mock("jsonwebtoken", () => ({
  decode: jest.fn(),
  verify: jest.fn(),
}));
const mockedDecode = decode as jest.MockedFunction<typeof decode>;

// Spy on crypto to generate a fixed UUID for testing
jest.spyOn(crypto, "randomUUID").mockReturnValue("0-0-0-0-0");

describe("POST /launch", () => {
  afterAll(() => {
    test.cleanup();
  });

  it("should return 400 with missing state parameter", async () => {
    const res = await request(app).post("/v1/lti/launch");
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Invalid LTI request");
  });

  it("should return 400 if JWT is missing claims", async () => {
    const mockJwt = {
      header: {
        kid: "testKid",
      },
      payload: {
        "https://purl.imsglobal.org/spec/lti/claim/context": {
          title: "LiveLearn Test Course",
        },
        "https://purl.imsglobal.org/spec/lti/claim/custom": {
          "user_id": "133",
        },
      },
    };
    mockedDecode.mockImplementation(() => mockJwt);

    await db.collection("temp").doc("testLaunch").create({iss: "TestIss", clientID: "TestId"});
    const res = await request(app)
      .post("/v1/lti/launch")
      .send({state: "testLaunch"})
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Missing required LTI parameters");
  });

  it("should redirect to app if course and user exist", async () => {
    const mockJwt = {
      header: {
        kid: "testKid",
      },
      payload: {
        "https://purl.imsglobal.org/spec/lti/claim/context": {
          title: "LiveLearn Test Course",
        },
        "https://purl.imsglobal.org/spec/lti/claim/roles": ["Instructor"],
        "https://purl.imsglobal.org/spec/lti/claim/custom": {
          "user_id": "133",
          "course_id": "206",
          "api_domain": "ufldev.instructure.com",
        },
      },
    };
    mockedDecode.mockImplementation(() => mockJwt);

    await db.collection("temp").doc("testLaunch").create({iss: "TestIss", clientID: "TestId"});
    const res = await request(app)
      .post("/v1/lti/launch")
      .send({state: "testLaunch"})
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain("https://livelearn-fe28b.web.app?token=");
  });

  it("should return 401 if course doesn't exist and user isn't instructor", async () => {
    const mockJwt = {
      header: {
        kid: "testKid",
      },
      payload: {
        "https://purl.imsglobal.org/spec/lti/claim/context": {
          title: "Jest Test Course",
        },
        "https://purl.imsglobal.org/spec/lti/claim/roles": ["Learner"],
        "https://purl.imsglobal.org/spec/lti/claim/custom": {
          "user_id": "133",
          "course_id": "000",
          "api_domain": "ufldev.instructure.com",
        },
      },
    };
    mockedDecode.mockImplementation(() => mockJwt);

    await db.collection("temp").doc("testLaunch").create({iss: "TestIss", clientID: "TestId"});
    const res = await request(app)
      .post("/v1/lti/launch")
      .send({state: "testLaunch"})
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message", "Instructor must enable the course");
  });

  it("should redirect to Canvas auth if course doesn't exist and user is instructor", async () => {
    const mockJwt = {
      header: {
        kid: "testKid",
      },
      payload: {
        "https://purl.imsglobal.org/spec/lti/claim/context": {
          title: "Jest Test Course",
        },
        "https://purl.imsglobal.org/spec/lti/claim/roles": ["Instructor"],
        "https://purl.imsglobal.org/spec/lti/claim/custom": {
          "user_id": "133",
          "course_id": "000",
          "api_domain": "ufldev.instructure.com",
        },
      },
    };
    mockedDecode.mockImplementation(() => mockJwt);

    await db.collection("temp").doc("testLaunch").create({iss: "TestIss", clientID: "TestId"});
    const res = await request(app)
      .post("/v1/lti/launch")
      .send({state: "testLaunch"})
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain("https://ufldev.instructure.com/login/oauth2/auth");

    const paramsDoc = await db.collection("temp").doc("0-0-0-0-0").get();
    expect(paramsDoc.data()).toBeDefined();
    expect(paramsDoc.data()!.courseId).toEqual("000ufldev");
    expect(paramsDoc.data()!.courseName).toEqual("Jest Test Course");
    await paramsDoc.ref.delete();
  });
});
