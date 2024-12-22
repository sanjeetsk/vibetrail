import React, { useState } from "react";
import { db, storage, auth } from "../../firebase"; // Firebase setup
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { toast } from "react-toastify";
import { useAuthState } from 'react-firebase-hooks/auth';
import { IoMdArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import "./styles.css";

function CreatePost() {
    const [text, setText] = useState("");
    const [images, setImages] = useState([]);
    const [videos, setVideos] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [user] = useAuthState(auth);
    const [progress, setProgress] = useState(0);

    const navigate = useNavigate();

    // Handle file selection
    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        const imageFiles = selectedFiles.filter(file => file.type.startsWith('image/'));
        const videoFiles = selectedFiles.filter(file => file.type.startsWith('video/'));
        setImages((prev) => [...prev, ...imageFiles]);
        setVideos((prev) => [...prev, ...videoFiles]);
    };

    // Upload files to Firebase Storage and get URLs
    const uploadFiles = async (files, folder) => {

        const uploadPromises = files.map((file) => {
            const storageRef = ref(storage, `posts/${user.uid}/${folder}/${Date.now()}_${file.name}`);
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
        if (!text && images.length === 0 && videos.length === 0) {
            toast.error("Please add some text or media.");
            return;
        }

        setUploading(true);
        try {
            // Upload files and get their URLs
            const imageURLs = images.length > 0 ? await uploadFiles(images, 'images') : [];
            const videoURLs = videos.length > 0 ? await uploadFiles(videos, 'videos') : [];

            // Add post data to Firestore
            const postRef = collection(db, "posts");
            await addDoc(postRef, {
                userName: user.displayName,
                userPhoto: user.photoURL,
                text: text,
                userId: user.uid,
                images: imageURLs,
                videos: videoURLs,
                createdAt: serverTimestamp(),
            });

            toast.success("Post created successfully!");
            setText("");
            setImages([]);
            setVideos([]);
            navigate("/dashboard");
        } catch (error) {
            toast.error("Error creating post: ", error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="create-post">
            <div className="header">
                <div className="back-button" onClick={() => navigate("/dashboard")}>
                    <IoMdArrowRoundBack />
                </div>
                <h3>New Post</h3>
            </div>
            <form onSubmit={handleSubmit}>
                <textarea
                    placeholder="What's on your mind?"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows="4"
                />
                <input type="file" multiple accept="image/*,video/*" onChange={handleFileChange} />
                <div className="file-preview">
                    {images.map((file, index) => (
                        <p key={index}>{file.name} (Image)</p>
                    ))}
                    {videos.map((file, index) => (
                        <p key={index}>{file.name} (Video)</p>
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