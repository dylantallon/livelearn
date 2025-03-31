/* eslint-disable max-len */
// eslint-disable-next-line require-jsdoc
function generateLtiConfigJson() {
  return {
    "title": "LiveLearn",
    "description": "A polling and attendance app in Canvas.",
    "oidc_initiation_url": "https://us-central1-livelearn-fe28b.cloudfunctions.net/api/v1/lti/initiation",
    "target_link_uri": "https://livelearn-fe28b.web.app",
    "scopes": [
      "https://purl.imsglobal.org/spec/lti-ags/scope/lineitem",
      "https://purl.imsglobal.org/spec/lti-ags/scope/result.readonly",
      "https://purl.imsglobal.org/spec/lti-ags/scope/score",
    ],
    "extensions": [
      {
        "platform": "canvas.instructure.com",
        "privacy_level": "public",
        "settings": {
          "text": "LiveLearn",
          "placements": [
            {
              "placement": "course_navigation",
              "message_type": "LtiResourceLinkRequest",
            },
          ],
        },
      },
    ],
    "public_jwk": {
      "kty": "RSA",
      "e": "AQAB",
      "use": "sig",
      "kid": "IjJli9i9OYI-Tkpqa7FsubecScrWsgmcerpl1YBBGWo",
      "alg": "RS256",
      "n": "u2bcgnTC3UO0v3P0tE9qIvH0kPZDATlRWrPZQnhPlxbDzNAaIcPbS6pKI_rcu1h6BfSqaH78sjiU_SUMXlGDA7vrteh0VsOm3zIUHw_Iigzy7y4wQU-ydxs0E-yFZmMx7epSD1yIX2eYwXbT-MSvb5oSOdBQHZ9Va041qgn9Sl0HODqjvVspN-V-VUyGlMo7RNKy66Ljt3zr_sCnzaO8Wvvukbf8hrgF7m6DyQZAcaQLrDnIVnIRPbyuC02J_cMCyqxqnSPOEh-qBVZh9cSAemsQjMFdKJFodfIKB5VxEFGrfxirj9fcojz6raBUsfLFJ_GnrqLNUjLLV9j3gVVarw",
    },
  };
}

export {generateLtiConfigJson};
