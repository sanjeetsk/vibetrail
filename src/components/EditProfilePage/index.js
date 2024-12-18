import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import "./styles.css";

function EditProfile() {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const navigate = useNavigate();

  // Fetch current user data
  const fetchUserData = async () => {
    const userRef = doc(db, "users", "sakshi_uid"); // Replace with dynamic user ID
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      setName(data.name);
      setBio(data.bio);
      setPhotoURL(data.photoURL);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Save updated data
  const handleSave = async () => {
    const userRef = doc(db, "users", "sakshi_uid");
    await updateDoc(userRef, {
      name,
      bio,
      photoURL,
    });
    navigate("/profile");
  };

  return (
    <div className="edit-profile-container">
      <h2>Edit Profile</h2>
      <div className="edit-profile-header">
        <img src={photoURL} alt="Profile" className="edit-profile-image" />
        <input
          type="text"
          value={photoURL}
          placeholder="Profile Image URL"
          onChange={(e) => setPhotoURL(e.target.value)}
        />
      </div>

      {/* Name Input */}
      <label>Name</label>
      <input
        type="text"
        value={name}
        placeholder="Enter your name"
        onChange={(e) => setName(e.target.value)}
      />

      {/* Bio Input */}
      <label>Bio</label>
      <textarea
        rows="3"
        value={bio}
        placeholder="Write your bio..."
        onChange={(e) => setBio(e.target.value)}
      ></textarea>

      <button className="save-button" onClick={handleSave}>
        SAVE
      </button>
    </div>
  );
}

export default EditProfile;
