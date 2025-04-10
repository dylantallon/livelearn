import {sign} from "jsonwebtoken";

import {db} from "../config/firebaseConfig";
import {functionUrl, livelearnDomain} from "./constants";
import {getClientIdAndSecret} from "./LtiUtils";
import jwkToBuffer from "jwk-to-pem";

const headers = {
  "accept": "application/json",
  "content-type": "application/json",
};

/**
 * Requests API access token from Canvas
 * @param {string} code
 * @param {string} domain
 */
async function requestAccessToken(code: string, domain: string) {
  const {apiClientId, apiClientSecret} = await getClientIdAndSecret(domain);
  const params = {
    grant_type: "authorization_code",
    client_id: apiClientId,
    client_secret: apiClientSecret,
    redirect_uri: `https://${livelearnDomain}/enableCourse`,
    code: code,
  };
  const response = await fetch(`https://${domain}/login/oauth2/token`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(params),
  });
  const json = await response.json();

  if (json.error) {
    throw new Error(json.error_description);
  }
  return json;
}

/**
 * Requests new API token from Canvas using refresh token
 * @param {string} refreshToken
 * @param {string} courseId
 * @param {string} domain
 */
async function refreshAccessToken(refreshToken: string, courseId: string, domain: string) {
  const {apiClientId, apiClientSecret} = await getClientIdAndSecret(domain);
  const params = {
    grant_type: "refresh_token",
    client_id: apiClientId,
    client_secret: apiClientSecret,
    refresh_token: refreshToken,
  };
  const response = await fetch(`https://${domain}/login/oauth2/token`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(params),
  });
  const json = await response.json();

  if (json.access_token) {
    const courseRef = db.collection("courses").doc(courseId);
    await courseRef.update({accessToken: json.access_token});
  }
  if (json.error) {
    throw new Error(json.error_description);
  }
  return json;
}

/**
 * Requests token to access Assignment Grading Services
 * @param {string} courseId
 */
async function requestAGSToken(courseId: string) {
  const domain = courseId.substring(courseId.search(/[A-Z]/i)) + ".instructure.com";
  const {ltiClientId} = await getClientIdAndSecret(domain);
  const keyData = (await db.collection("consumers").doc("livelearn").get()).data();
  const jwt = sign({}, jwkToBuffer(keyData!.private_key, {private: true}), {
    algorithm: "RS256",
    keyid: keyData!.kid,
    issuer: functionUrl,
    subject: ltiClientId,
    audience: `https://${domain}/login/oauth2/token`,
    expiresIn: 50000,
    jwtid: crypto.randomUUID(),
  });

  const params = {
    grant_type: "client_credentials",
    client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
    client_assertion: jwt,
    scope: "https://purl.imsglobal.org/spec/lti-ags/scope/lineitem " +
      "https://purl.imsglobal.org/spec/lti-ags/scope/result.readonly " +
      "https://purl.imsglobal.org/spec/lti-ags/scope/score",
  };
  const response = await fetch(`https://${domain}/login/oauth2/token`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(params),
  });
  const json = await response.json();

  if (json.access_token) {
    const courseRef = db.collection("courses").doc(courseId);
    await courseRef.update({agsToken: json.access_token});
  }
  if (json.error) {
    throw new Error(json.error_description);
  }
  return json;
}

export {requestAccessToken, refreshAccessToken, requestAGSToken};
