import { useEffect, useState } from "react";
import { doc, updateDoc, getDoc, query, where, getDocs, collection } from "firebase/firestore";
import { db, auth, storage } from "../../firebase";
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from "react-router-dom";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import './styles.css';
import { IoMdArrowRoundBack } from "react-icons/io";
import { MdEdit } from "react-icons/md";
import defaultuser from '../../assets/user.jpg';
import defaultcover from '../../assets/coverphoto.png';
import { toast } from "react-toastify";

function EditProfilePage() {
  const [authUser, loading, error] = useAuthState(auth); // Get the authenticated user
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [coverPhoto, setCoverPhoto] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (authUser) {  // Check if authUser is not null
      const fetchUserData = async () => {
        const userRef = doc(db, "users", authUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setName(data.name || "");
          setBio(data.bio || "Hi there! I'm using vibeTrail.");
          setPhotoURL(data.photoURL || defaultuser);
          setCoverPhoto(data.coverPhoto || defaultcover);
        }
      };
      fetchUserData();
    } else if (error) {
      toast.error("Authentication error:", error);
      // Handle the authentication error, e.g., redirect to login
      navigate('/');
    }
  }, [authUser, error, navigate]); // Add dependencies to useEffect

  const updateRelatedDocuments = async (newPhotoURL) => {
    try {
      // Query and update documents referencing the user's photoURL
      const userPostsRef = collection(db, "posts"); // Example collection
      const userPostsQuery = query(userPostsRef, where("userId", "==", authUser.uid));
      const userPostsSnap = await getDocs(userPostsQuery);

      const updatePromises = userPostsSnap.docs.map((doc) =>
        updateDoc(doc.ref, { userPhoto: newPhotoURL }) // Update the relevant field
      );

      await Promise.all(updatePromises);
      toast.success("Related documents updated successfully");
    } catch (err) {
      toast.error("Error updating related documents:", err);
    }
  };

  const handleSave = async () => {
    if (!authUser) return;

    const updates = {}; // Object to hold only the fields that need updating
    if (name) updates.name = name;
    if (bio) updates.bio = bio;
    if (photoURL) updates.photoURL = photoURL;
    if (coverPhoto) updates.coverPhoto = coverPhoto;

    setUploading(true);
    try {
      const userRef = doc(db, "users", authUser.uid);
      await updateDoc(userRef, updates);

      if (updates.photoURL) {
        // Update related documents if photoURL is changed
        await updateRelatedDocuments(updates.photoURL);
      }

      toast.success("Profile updated successfully!");
      navigate("/profilePage"); // Navigate back to profile page after saving
    } catch (error) {
      toast.error("Error updating profile:", error);
    } finally {
      setUploading(false);
    }
  };

  const openModal = (type) => {
    setUploadType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadType) return;

    const storageRef = ref(storage, `users/${authUser.uid}/${uploadType}_${Date.now()}`);
    const uploadTask = uploadBytesResumable(storageRef, selectedFile);

    setUploading(true);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Track upload progress
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setProgress(progress);
      },
      (error) => toast.error("Upload failed:", error),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        if (uploadType === "profile") {
          setPhotoURL(downloadURL);
        } else if (uploadType === "cover") {
          setCoverPhoto(downloadURL);
        }
        setUploading(false);
        closeModal();
      }
    );
  };

  if (loading) {
    return <div>Loading...</div>; // Display a loading indicator
  }

  return (
    <div className="edit-profile-container">
      <div className="cover-photo-section">
        <img
          src={coverPhoto || defaultcover} alt="coverPhoto" className="cover-img" />
        <div className="header">
          <div className="back-button" onClick={() => navigate("/profilePage")}>
            <IoMdArrowRoundBack />
          </div>
          <h3>Edit Profile</h3>
        </div>
        <div className="profile-section">
          <div className="profile-picture">
            <img
              src={photoURL || defaultuser}
              alt="Profile"
              className="profile-image"
            />
            <div className="edit-photo-button" onClick={() => openModal("profile")}>
              <MdEdit />
            </div>
          </div>
        </div>
        <div className="edit-icon" onClick={() => openModal("cover")}><MdEdit /></div>
      </div>

      <div className="form">
        <label>
          Name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
          />
        </label>
        <label>
          Bio
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us something about yourself"
          />
        </label>
        <button className="save-button" onClick={handleSave}>
          SAVE
        </button>
      </div>
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Upload {uploadType === "profile" ? "Profile Picture" : "Cover Photo"}</h3>
            <input type="file" onChange={handleFileChange} />
            <div className="modal-actions">
              <button onClick={handleUpload}>
                {uploading ? `Uploading...${progress}%` : "Upload"}
              </button>
              <button onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditProfilePage;
