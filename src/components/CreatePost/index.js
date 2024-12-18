import React, { useState } from "react";
import { db, storage, auth } from "../../firebase"; // Firebase setup
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { toast } from "react-toastify";
import { useAuthState } from 'react-firebase-hooks/auth';
import "./styles.css";

function CreatePost() {
    const [text, setText] = useState("");
    const [files, setFiles] = useState([]); // Holds selected files
    const [uploading, setUploading] = useState(false);
    const [user] = useAuthState(auth);
    const [progress, setProgress] = useState(0);

    // Handle file selection
    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(selectedFiles);
    };

    // Upload files to Firebase Storage and get URLs
    const uploadFiles = async () => {

        const uploadPromises = files.map((file) => {
            const storageRef = ref(storage, `posts/${user.uid}/${Date.now()}_${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            return new Promise((resolve, reject) => {
                uploadTask.on(
                    "state_changed",
                    (snapshot) => {
                        // Track upload progress
                        const progress = Math.round(
                          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                        );
                        setProgress(progress);
                    },
                    (error) => reject(error),
                    async () => {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        resolve(downloadURL);
                    }
                );
            });
        });

        return Promise.all(uploadPromises);
    };

    // Handle post submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text && files.length === 0) {
            toast.error("Please add some text or media.");
            return;
        }

        setUploading(true);
        try {
            // Upload files and get their URLs
            const mediaURLs = files.length > 0 ? await uploadFiles() : [];

            // Add post data to Firestore
            const postRef = collection(db, "posts");
            await addDoc(postRef, {
                userName: user.displayName,
                userPhoto: user.photoURL,
                text: text,
                userId: user.uid,
                images: mediaURLs,
                createdAt: serverTimestamp(),
            });

            toast.success("Post created successfully!");
            setText("");
            setFiles([]);
        } catch (error) {
            console.error("Error creating post: ", error);
            toast.error("Failed to create post.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="create-post">
            <h3>Create Post</h3>
            <form onSubmit={handleSubmit}>
                <textarea
                    placeholder="What's on your mind?"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows="4"
                />
                <input type="file" multiple accept="image/*,video/*" onChange={handleFileChange} />
                <div className="file-preview">
                    {files.map((file, index) => (
                        <p key={index}>{file.name}</p>
                    ))}
                </div>
                <button type="submit" disabled={uploading}>
                    {uploading ? `Uploading...${progress}%` : "Post"}
                </button>
            </form>
        </div>
    );
}

export default CreatePost;