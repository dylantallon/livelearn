import * as admin from "firebase-admin";
import {getFirestore} from "firebase-admin/firestore";

// eslint-disable-next-line max-len
admin.initializeApp({credential: admin.credential.cert("src/config/livelearn-fe28b-firebase-adminsdk-fbsvc-325f5608b2.json")});

export const db = getFirestore();
