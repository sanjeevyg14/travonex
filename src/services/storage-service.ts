import { storage } from "@/lib/firebase/client";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const storageService = {
    async uploadFile(file: File, path: string): Promise<string> {
        const storageRef = ref(storage, path);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    },

    async uploadImage(file: File, folder: string = "uploads"): Promise<string> {
        const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
        return this.uploadFile(file, `${folder}/${fileName}`);
    }
};
