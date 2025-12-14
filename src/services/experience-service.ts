
import { db } from "@/lib/firebase/client";
import { Experience } from "@/lib/types";
import { collection, doc, getDoc, getDocs, orderBy, limit, query, where } from "firebase/firestore";

export const experienceService = {
    async getExperience(id: string): Promise<Experience | null> {
        const docRef = doc(db, "experiences", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Experience;
        }
        return null;
    },

    async getTopExperiences(limitCount: number = 8): Promise<Experience[]> {
        // Currently we don't have a 'rating' field indexed for sorting easily unless we add it to schema
        // For now, simple fetch. Ideally add orderBy("rating", "desc")
        const q = query(
            collection(db, "experiences"),
            limit(limitCount)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Experience));
    }
};
