import { initializeApp } from "firebase/app";
import { getFirestore, collection, setDoc, doc, query, orderBy, limit, getDocs } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDtuAIyTOtnp_DBbH-_kyw8FKogGF3gU_Y",
    authDomain: "spaceone-b7776.firebaseapp.com",
    projectId: "spaceone-b7776",
    storageBucket: "spaceone-b7776.firebasestorage.app",
    messagingSenderId: "297663058464",
    appId: "1:297663058464:web:f6bc904e27d686bbef6245",
    measurementId: "G-5HRPSC10P4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const db = getFirestore(app);

const COLLECTION_NAME = "leaderboard";

export interface LeaderboardEntry {
    nickname: string;
    score: number; // Time in seconds
    timestamp: number;
}

export const FirebaseAPI = {
    /**
     * Save a new score to Firestore.
     * @param nickname Player's nickname
     * @param score Time survived in seconds
     */
    async saveScore(nickname: string, score: number, sessionId: string) {
        try {
            await setDoc(doc(db, COLLECTION_NAME, sessionId), {
                nickname,
                score,
                timestamp: Date.now()
            });
            console.log("Score saved/updated to Firebase");
        } catch (e) {
            console.error("Error writing document: ", e);
        }
    },

    /**
     * Fetch the top 10 scores from Firestore.
     */
    async getTopScores(count: number = 10): Promise<LeaderboardEntry[]> {
        const results: LeaderboardEntry[] = [];
        try {
            const q = query(
                collection(db, COLLECTION_NAME),
                orderBy("score", "desc"),
                limit(count)
            );

            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                results.push({
                    nickname: data.nickname,
                    score: data.score,
                    timestamp: data.timestamp
                });
            });
        } catch (e) {
            console.error("Error fetching leaderboard: ", e);
        }
        return results;
    }
};
