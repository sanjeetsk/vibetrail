import { useState, useEffect } from "react";
import { collection, query, where, getDocs, getDoc, doc } from "firebase/firestore";
import { db, auth } from "../../firebase";
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from "react-router-dom";

function ProfilePage() {
    const [user, setUser] = useState({});
    const [posts, setPosts] = useState([]);
    const navigate = useNavigate();
    const users = useAuthState(auth);

    // Fetch user profile data
    const fetchUserData = async () => {
        const userRef = doc(db, "users", users.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) setUser(userSnap.data());
    };

    // Fetch user's posts
    const fetchUserPosts = async () => {
        const postsRef = collection(db, "posts"); // Reference to the 'posts' collection
        // Query to filter posts where userId matches the current user's UID
        const q = query(postsRef, where("userId", "==", users.uid));
        const querySnapshot = await getDocs(q);
        const userPosts = [];
        querySnapshot.forEach((doc) => {
            if (doc.data().userId === user.uid) {
                userPosts.push({ id: doc.id, ...doc.data() });
            }
        });
        // Map the posts to state
        // const userPosts = querySnapshot.docs.map((doc) => ({
        //     id: doc.id,
        //     ...doc.data(),
        //   }));
        setPosts(userPosts);
    };

    useEffect(() => {
        fetchUserData();
        fetchUserPosts();
    }, []);

    return (
        <div className="profile-container">
            {/* Profile Header */}
            <div className="profile-header">
                <img src={user.userPhoto} alt="Profile" className="profile-image" />
                <h2>{user.name}</h2>
                <p className="bio">{user.bio}</p>
                <button className="edit-button" onClick={() => navigate("/editProfile")}>
                    Edit Profile
                </button>
            </div>

            {/* My Posts */}
            <h3>My Posts</h3>
            <div className="posts-container">
                {posts.map((post) => (
                    <div key={post.id} className="post-card">
                        {post.images && (
                            <img src={post.images[0]} alt="Post" className="post-image" />
                        )}
                        <p>{post.text}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ProfilePage;
