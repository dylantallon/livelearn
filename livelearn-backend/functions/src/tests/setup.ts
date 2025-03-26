import * as firebaseFunctionsTest from "firebase-functions-test";

const test = firebaseFunctionsTest.default({
  databaseURL: "https://livelearn-fe28b.firebaseio.com",
  storageBucket: "livelearn-fe28b.firebasestorage.app",
  projectId: "livelearn-fe28b",
}, "src/config/livelearn-fe28b-firebase-adminsdk-fbsvc-325f5608b2.json");

export {test};
