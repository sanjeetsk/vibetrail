import { useEffect, useState } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db, auth } from "../../firebase";
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from "react-router-dom";
import './styles.css';
import { IoMdArrowRoundBack } from "react-icons/io";
import { MdEdit } from "react-icons/md";

function EditProfilePage() {
  const [authUser, loading, error] = useAuthState(auth); // Get the authenticated user
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [photoURL, setPhotoURL] = useState(""); // Optional: to update profile picture
  const navigate = useNavigate();

  useEffect(() => {
    if (authUser) {  // Check if authUser is not null
      const fetchUserData = async () => {
        const userRef = doc(db, "users", authUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setName(data.name);
          setBio(data.bio);
          setPhotoURL(data.photoURL);
        }
      };
      fetchUserData();
    } else if (error) {
      console.error("Authentication error:", error);
      // Handle the authentication error, e.g., redirect to login
      navigate('/login'); // Example: Redirect to login page
    }
  }, [authUser, error, db, navigate]); // Add dependencies to useEffect


  const handleSave = async () => {
    if (!authUser) return;
    try {
      const userRef = doc(db, "users", authUser.uid);
      await updateDoc(userRef, {
        name,
        bio,
        photoURL, // Optional: update if you allow profile picture changes
      });
      navigate("/profilePage"); // Navigate back to profile page after saving
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Display a loading indicator
  }

  return (
    <div className="edit-profile-container">
      <div className="cover-photo-section">
        <div className="header">
          <div className="back-button" onClick={() => navigate("/profilePage")}>
            <IoMdArrowRoundBack />
          </div>
          <h3>Edit Profile</h3>
        </div>
        <div className="profile-section">
          <div className="profile-picture">
            <img
              src={photoURL || "/default-profile.png"}
              alt="Profile"
              className="profile-image"
            />
            <div className="edit-photo-button" onClick={() => console.log("Edit photo clicked")}>
              <MdEdit />
            </div>
          </div>
        </div>
        <MdEdit className="edit-icon"/>
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
    </div>
  );
}

export default EditProfilePage;
