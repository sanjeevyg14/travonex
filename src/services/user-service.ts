import { db } from "@/lib/firebase/client";
import { User } from "@/lib/types";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

export const userService = {
    async getUser(uid: string): Promise<User | null> {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
            return userDoc.data() as User;
        }
        return null;
    },

    async createUser(user: User): Promise<void> {
        await setDoc(doc(db, "users", user.id), user);
    },

    async updateUser(uid: string, data: Partial<User>): Promise<void> {
        await updateDoc(doc(db, "users", uid), data);
    },

    async syncUser(uid: string, phone: string, additionalData?: Partial<User>): Promise<User> {
        const existing = await this.getUser(uid);
        if (existing) {
            return existing;
        }

        // New User Default Logic
        const newUser: User = {
            id: uid,
            phone: phone,
            name: additionalData?.name || "New User",
            email: additionalData?.email || "",
            role: 'traveler',
            status: 'active',
            joinDate: new Date().toISOString(),
            walletBalance: 0,
            ...additionalData
        };

        await this.createUser(newUser);
        return newUser;
    }
};
