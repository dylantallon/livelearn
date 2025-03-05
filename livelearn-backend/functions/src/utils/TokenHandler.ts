import {db} from "../config/firebaseConfig";
import {livelearnDomain} from "./constants";
import {getClientIdAndSecret} from "./LtiUtils";

const headers = {
  "accept": "application/json",
  "content-type": "application/json",
};

/**
 * Requests access token form Canvas
 * @param {string} code
 * @param {string} domain
 */
async function requestAccessToken(code: string, domain: string) {
  const {clientId, clientSecret} = await getClientIdAndSecret(domain);
  const params = {
    grant_type: "authorization_code",
    client_id: clientId,
    client_secret: clientSecret,
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
 * Requests new token from Canvas using refresh token
 * @param {string} refreshToken
 * @param {string} courseId
 * @param {string} domain
 */
async function refreshAccessToken(refreshToken: string, courseId: string, domain: string) {
  const {clientId, clientSecret} = await getClientIdAndSecret(domain);
  const params = {
    grant_type: "refresh_token",
    client_id: clientId,
    client_secret: clientSecret,
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
    await courseRef.update({token: json.access_token});
  }
  if (json.error) {
    throw new Error(json.error_description);
  }
  return json;
}

export {requestAccessToken, refreshAccessToken};
