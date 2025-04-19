import request from "supertest";
import {decode} from "jsonwebtoken";

import {db} from "../config/firebaseConfig";
import {app} from "..";
import {test} from "./setup";
import {requestAccessToken} from "../utils/TokenHandler";

// Mock JWT to return test data when decoded and to ignore verification
jest.mock("jwk-to-pem");
jest.mock("jsonwebtoken", () => ({
  decode: jest.fn(),
  verify: jest.fn(),
}));
const mockedDecode = decode as jest.MockedFunction<typeof decode>;

// Mock token handler to return mock tokens
jest.mock("../utils/TokenHandler", () => ({
  requestAccessToken: jest.fn(),
}));
const mockedAccessToken = requestAccessToken as jest.MockedFunction<typeof requestAccessToken>;

// Spy on crypto to generate a fixed UUID for testing
jest.spyOn(crypto, "randomUUID").mockReturnValue("0-0-0-0-0");

describe("POST /initiation", () => {
  afterAll(() => {
    test.cleanup();
  });

  it("should return 400 with missing parameters", async () => {
    const res = await request(app).post("/v1/lti/initiation");
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Missing required LTI parameters");
  });

  it("should return redirect to Canvas auth", async () => {
    const res = await request(app)
      .post("/v1/lti/initiation")
      .send({
        iss: "testIss",
        login_hint: "testLoginHint",
        target_link_uri: "testTargetLink",
        client_id: "testClientID",
        lti_message_hint: "testMessageHint",
      })
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain("https://sso.canvaslms.com/api/lti/authorize_redirect");

    // Assert that doc with launch params was created
    const paramsDoc = await db.collection("temp").doc("0-0-0-0-0").get();
    expect(paramsDoc.data()).toBeDefined();
    expect(paramsDoc.data()!.iss).toEqual("testIss");
    expect(paramsDoc.data()!.clientID).toEqual("testClientID");
    await paramsDoc.ref.delete();
  });
});

describe("POST /launch", () => {
  afterAll(() => {
    test.cleanup();
  });

  it("should return 400 with missing parameters", async () => {
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
      .send({state: "testLaunch", id_token: "testToken"})
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
        "name": "Test User",
      },
    };
    mockedDecode.mockImplementation(() => mockJwt);

    await db.collection("temp").doc("testLaunch").create({iss: "TestIss", clientID: "TestId"});
    const res = await request(app)
      .post("/v1/lti/launch")
      .send({state: "testLaunch", id_token: "testToken"})
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
        "name": "Test User",
      },
    };
    mockedDecode.mockImplementation(() => mockJwt);

    await db.collection("temp").doc("testLaunch").create({iss: "TestIss", clientID: "TestId"});
    const res = await request(app)
      .post("/v1/lti/launch")
      .send({state: "testLaunch", id_token: "testToken"})
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
        "name": "Test User",
      },
    };
    mockedDecode.mockImplementation(() => mockJwt);

    await db.collection("temp").doc("testLaunch").create({iss: "TestIss", clientID: "TestId"});
    const res = await request(app)
      .post("/v1/lti/launch")
      .send({state: "testLaunch", id_token: "testToken"})
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain("https://ufldev.instructure.com/login/oauth2/auth");

    // Assert that doc with enable course params was created
    const paramsDoc = await db.collection("temp").doc("0-0-0-0-0").get();
    expect(paramsDoc.data()).toBeDefined();
    expect(paramsDoc.data()!.courseId).toEqual("000ufldev");
    expect(paramsDoc.data()!.courseName).toEqual("Jest Test Course");
    await paramsDoc.ref.delete();
  });
});

describe("GET /enableCourse", () => {
  afterAll(() => {
    test.cleanup();
  });

  it("should return 400 with missing parameters", async () => {
    const res = await request(app).get("/v1/lti/enableCourse");
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Missing required parameters");
  });

  it("should return redirect and create course successfully", async () => {
    // Create doc with enable course params
    await db.collection("temp").doc("0-0-0-0-0").create({
      courseId: "000ufldev",
      courseName: "Jest Test Course",
      userId: "133ufldev",
      userName: "Test User",
    });
    // Return mocked Canvas tokens
    const mockTokens = {
      access_token: "Test Access Token",
      refresh_token: "Test Refresh Token",
    };
    mockedAccessToken.mockImplementation(() => Promise.resolve(mockTokens));

    const res = await request(app).get("/v1/lti/enableCourse?code=TestCode&state=0-0-0-0-0");
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain("https://livelearn-fe28b.web.app?token=");

    // Assert that course doc was created
    const courseDoc = await db.collection("courses").doc("000ufldev").get();
    expect(courseDoc.data()).toBeDefined();
    expect(courseDoc.data()!.name).toEqual("Jest Test Course");
    expect(courseDoc.data()!.instructors).toEqual(["133ufldev"]);
    expect(courseDoc.data()!.accessToken).toEqual("Test Access Token");
    expect(courseDoc.data()!.refreshToken).toEqual("Test Refresh Token");
    await courseDoc.ref.delete();
  });
});
