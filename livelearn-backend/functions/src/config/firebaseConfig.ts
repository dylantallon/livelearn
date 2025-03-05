import * as admin from "firebase-admin";
import {getFirestore} from "firebase-admin/firestore";

// eslint-disable-next-line max-len
admin.initializeApp();

export const db = getFirestore();
