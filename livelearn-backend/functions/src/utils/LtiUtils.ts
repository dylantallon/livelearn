/* eslint-disable max-len */
import {db} from "../config/firebaseConfig";

/**
 * Returns an array of instructor roles.
 *
 * @return {Array} An array of instructor roles.
 */
function getInstructorRoles() {
  return [
    "Administrator",
    "Instructor",
    "Facilitator",
    "http://purl.imsglobal.org/vocab/lis/v2/institution/person#Administrator",
    "http://purl.imsglobal.org/vocab/lis/v2/institution/person#Instructor",
    "http://purl.imsglobal.org/vocab/lis/v2/institution/person#Facilitator",
  ];
}

/**
 * Returns an array of assistant roles.
 *
 * @return {Array} An array of assistant roles.
 */
function getAssistantRoles() {
  return [
    "Ta",
    "TA",
    "TeachingAssistant",
    "http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor",
    "http://purl.imsglobal.org/vocab/lis/v2/membership/Instructor#TeachingAssistant",
  ];
}

/**
 * Returns an array of observer roles.
 *
 * @return {Array} An array of observer roles.
 */
function getObserverRoles() {
  return [
    "Observer",
    "ProgramObserver",
    "http://purl.imsglobal.org/vocab/lis/v2/membership#Mentor",
  ];
}

/**
 * Returns the client ID and secret.
 *
 * @param {string} domain The Canvas API domain
 * @return {Object} The client ID and secret.
 */
async function getClientIdAndSecret(domain: string) {
  const consumerRef = db.collection("consumers").doc(domain);
  const consumerDoc = await consumerRef.get();
  const data = consumerDoc.data();

  return {
    clientId: data!.clientID,
    clientSecret: data!.clientSecret,
  };
}

export {
  getInstructorRoles,
  getAssistantRoles,
  getObserverRoles,
  getClientIdAndSecret,
};

