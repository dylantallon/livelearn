/* eslint-disable max-len */
import {create} from "xmlbuilder2";

// eslint-disable-next-line require-jsdoc
function generateLtiConfigXml() {
  const xmlRoot = create({
    version: "1.0",
    encoding: "UTF-8",
  }).ele("cartridge_basiclti_link", {
    "xmlns": "http://www.imsglobal.org/xsd/imslticc_v1p0",
    "xmlns:blti": "http://www.imsglobal.org/xsd/imsbasiclti_v1p0",
    "xmlns:lticm": "http://www.imsglobal.org/xsd/imslticm_v1p0",
    "xmlns:lticp": "http://www.imsglobal.org/xsd/imslticp_v1p0",
    "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
    "xsi:schemaLocation":
      "http://www.imsglobal.org/xsd/imslticc_v1p0 http://www.imsglobal.org/xsd/lti/ltiv1p0/imslticc_v1p0.xsd " +
      "http://www.imsglobal.org/xsd/imsbasiclti_v1p0 http://www.imsglobal.org/xsd/lti/ltiv1p0/imsbasiclti_v1p0p1.xsd " +
      "http://www.imsglobal.org/xsd/imslticm_v1p0 http://www.imsglobal.org/xsd/lti/ltiv1p0/imslticm_v1p0.xsd " +
      "http://www.imsglobal.org/xsd/imslticp_v1p0 http://www.imsglobal.org/xsd/lti/ltiv1p0/imslticp_v1p0.xsd",
  });

  xmlRoot.ele("blti:title", {
    "xmlns:blti": "http://www.imsglobal.org/xsd/imsbasiclti_v1p0",
  }).txt("LiveLearn");
  xmlRoot.ele("blti:description", {
    "xmlns:blti": "http://www.imsglobal.org/xsd/imsbasiclti_v1p0",
  }).txt( "A polling and attendance app in Canvas");
  xmlRoot.ele("blti:launch_url", {
    "xmlns:blti": "http://www.imsglobal.org/xsd/imsbasiclti_v1p0",
  }).txt( "https://us-central1-livelearn-fe28b.cloudfunctions.net/api/v1/lti/launch");
  xmlRoot.ele("blti:secure_launch_url", {
    "xmlns:blti": "http://www.imsglobal.org/xsd/imsbasiclti_v1p0",
  }).txt( "https://us-central1-livelearn-fe28b.cloudfunctions.net/api/v1/lti/launch");
  xmlRoot.ele("blti:vendor");

  const bltiExtensions = xmlRoot.ele("blti:extensions", {
    platform: "canvas.instructure.com",
  });

  const lticmOptions = bltiExtensions.ele("lticm:options", {
    name: "course_navigation",
  });
  lticmOptions.ele("lticm:property", {
    name: "default",
  }).txt("disabled");
  lticmOptions.ele("lticm:property", {
    name: "enabled",
  }).txt("true");

  bltiExtensions.ele("lticm:property", {
    name: "domain",
  }).txt("livelearn-fe28b.web.app");
  bltiExtensions.ele("lticm:property", {
    name: "privacy_level",
  }).txt("public");
  bltiExtensions.ele("lticm:property", {
    name: "selection_width",
  }).txt("800");
  bltiExtensions.ele("lticm:property", {
    name: "selection_height",
  }).txt("1600");
  bltiExtensions.ele("lticm:property", {
    name: "text",
  }).txt("LiveLearn");
  return xmlRoot.end({prettyPrint: true});
}

export {generateLtiConfigXml};
