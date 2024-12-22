import { useState, useEffect } from "react";
import { collection, query, where, getDocs, getDoc, doc } from "firebase/firestore";
import { db, auth } from "../../firebase";
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from "react-router-dom";
import { IoMdArrowRoundBack } from "react-icons/io";
import { IoMdAddCircle } from "react-icons/io";
import { FcLike } from "react-icons/fc";
import './styles.css';
import coverPhoto from '../../assets/coverphoto.png';
import defaultPhoto from '../../assets/user.jpg';
import { toast } from "react-toastify";


function ProfilePage() {
    const [user, setUser] = useState({});
    const [posts, setPosts] = useState([]);
    const [authUser, authLoading, authError] = useAuthState(auth); // Get the authenticated user
    const navigate = useNavigate();

    // Fetch user profile data
    const fetchUserData = async () => {
        if (!authUser) return;
        try {
            const userRef = doc(db, "users", authUser.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                setUser(userSnap.data());
            } else {
                toast.warn("No user profile found.");
            }
        } catch (error) {
            toast.error("Error fetching user data:", error);
        }
    };

    // Fetch user's posts
    const fetchUserPosts = async () => {
        if (!authUser) return;
        try {
            const postsRef = collection(db, "posts");
            const q = query(postsRef, where("userId", "==", authUser.uid));
            const querySnapshot = await getDocs(q);
            const userPosts = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setPosts(userPosts);
        } catch (error) {
            toast.error("Error fetching user posts:", error);
        }
    };

    // Effect to fetch data when authUser changes
    useEffect(() => {
        if (authLoading) return; // Wait for auth state to load
        if (authError) {
            toast.error("Authentication Error:", authError);
            return;
        }
        if (!authUser) {
            navigate("/"); // Redirect to login if not authenticated
            return;
        }
        fetchUserData();
        fetchUserPosts();
    }, [authUser, authLoading, authError]);

    if (authLoading) {
        return <p>Loading...</p>;
    }
    return (
        <>
            <div className="profile-container">
                {/* Profile Header */}
                <div className="cover-photo-section">
                    <img src={user.coverPhoto ? user.coverPhoto : coverPhoto} alt="coverPhoto" className="cover-img"/>
                    <div className="header">
                        <div className="back-button" onClick={() => navigate("/dashboard")}>
                            <IoMdArrowRoundBack />
                        </div>
                    </div>
                    <div className="profile-section">
                        <div className="profile-picture">
                            <img
                                src={user.photoURL ? user.photoURL : defaultPhoto}
                                alt="Profile"
                                className="profile-image"
                            />
                        </div>
                    </div>
                </div>
                <div className="profile-header">
                    <h2>{user.name}</h2>
                    <p className="bio">{user.bio || "No bio available"}</p>
                    <button className="edit-button" onClick={() => navigate("/editProfile")}>
                        Edit Profile
                    </button>
                </div>

                {/* My Posts */}
                <h3>My Posts</h3>
                <div className="posts-container">
                    {posts.length > 0 ? (
                        posts.map((post) => (
                            <div key={post.id} className="post-card">
                                {post.images && post.images.length > 0 && (
                                    <img src={post.images[0]} alt="Post" className="post-image" />
                                )}
                                {post.videos && post.videos.length > 0 && (
                                    <video controls src={post.videos[0]} className="post-image" />
                                )}
                                <div className="post-caption">
                                    <p className="post-text">{post.text.length > 20 ? post.text.substring(0, 20) + '...' : post.text}</p>
                                    <div className="post-likes"><FcLike className="like" /> {post.likes ? post.likes.length : 0} </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No posts to show.</p>
                    )}
                </div>
            </div>
            <div className="floating-button" onClick={() => navigate('/createPost')}>
                <IoMdAddCircle size={50} />
            </div>
        </>

    );
}

export default ProfilePage;
