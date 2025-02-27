import { db } from "../config/firebaseConfig";

/* eslint-disable max-len */
function getScopes() {
  return [
    // Courses
    'url:GET|/api/v1/courses',
    'url:GET|/api/v1/courses/:id',

    // Quizzes
    'url:GET|/api/v1/courses/:course_id/quizzes',
    'url:GET|/api/v1/courses/:course_id/quizzes/:id',

    // Quiz Submissions
    'url:GET|/api/v1/courses/:course_id/quizzes/:quiz_id/submissions',
    'url:PUT|/api/v1/courses/:course_id/quizzes/:quiz_id/submissions/:id',

    // Course users
    'url:GET|/api/v1/courses/:course_id/users/:id',
    'url:GET|/api/v1/courses/:course_id/users',

    // Course Assignments
    'url:GET|/api/v1/courses/:course_id/assignments',
    'url:GET|/api/v1/courses/:course_id/assignments/:id',
    // 'url:GET|/api/v1/courses/:course_id/assignment_groups',
    'url:GET|/api/v1/courses/:course_id/assignments/:assignment_id/overrides',

    // Assignment submissions
    'url:GET|/api/v1/courses/:course_id/assignments/:assignment_id/submissions',
    'url:GET|/api/v1/courses/:course_id/assignments/:assignment_id/submissions/:user_id',
    'url:PUT|/api/v1/courses/:course_id/assignments/:assignment_id/submissions/:user_id',

    // Files
    'url:GET|/api/v1/files/:id',
    'url:PUT|/api/v1/files/:id',
    'url:DELETE|/api/v1/files/:id',

    // Folders
    'url:GET|/api/v1/folders/:id/folders',
    'url:GET|/api/v1/folders/:id',
    'url:PUT|/api/v1/folders/:id',
    'url:DELETE|/api/v1/folders/:id',
    'url:POST|/api/v1/folders/:folder_id/folders',
    // 'url:POST/api/v1/folders/:folder_id/files',
    'url:POST|/api/v1/folders/:dest_folder_id/copy_file',
    'url:POST|/api/v1/folders/:dest_folder_id/copy_folder',

    // Files (Course)
    'url:GET|/api/v1/courses/:course_id/files/quota',
    'url:GET|/api/v1/courses/:course_id/files',
    'url:GET|/api/v1/courses/:course_id/files/:id',

    // Folders (Course)
    'url:GET|/api/v1/courses/:course_id/folders',
    'url:GET|/api/v1/courses/:course_id/folders/:id',
    'url:POST|/api/v1/courses/:course_id/folders',
  ];
}

/**
 * Returns an array of instructor roles.
 *
 * @return {Array} An array of instructor roles.
 */
function getInstructorRoles() {
  return [
    'Administrator',
    'Instructor',
    'Facilitator',
    'urn:lti:instrole:ims/lis/Administrator',
    'urn:lti:instrole:ims/lis/Instructor',
    'urn:lti:instrole:ims/lis/Facilitator',
    'urn:lti:instrole:ims/lis/ContentDeveloper',
  ];
}

/**
 * Returns an array of assistant roles.
 *
 * @return {Array} An array of assistant roles.
 */
function getAssistantRoles() {
  return [
    'Ta',
    'TA',
    'TeachingAssistant',
    'ContentDeveloper',
    'urn:lti:role:ims/lis/TeachingAssistant',
  ];
}

/**
 * Returns an array of observer roles.
 *
 * @return {Array} An array of observer roles.
 */
function getObserverRoles() {
  return [
    'Observer',
    'ProgramObserver',
    'urn:lti:role:ims/lis/Mentor',
    'urn:lti:role:ims/lis/Learner/NonCreditLearner',
  ];
}

/**
 * Returns the client ID and secret.
 *
 * @param {string} domain The Canvas API domain
 * @return {Object} The client ID and secret.
 */
async function getClientIdAndSecret(domain: string) {
  const consumerRef = db.collection('consumers').doc(domain);
  const consumerDoc = await consumerRef.get();
  const data = consumerDoc.data();

  return {
    clientId: data!.clientID,
    clientSecret: data!.clientSecret,
  };
}

export {
  getScopes,
  getInstructorRoles,
  getAssistantRoles,
  getObserverRoles,
  getClientIdAndSecret,
};

