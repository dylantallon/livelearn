import * as admin from 'firebase-admin'
import { getFirestore } from "firebase-admin/firestore";

admin.initializeApp();

export const db = getFirestore();