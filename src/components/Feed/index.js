import React, { useState, useEffect } from "react";
import { db } from "../../firebase"; // Import Firebase setup
import { collection, query, orderBy, limit, getDocs, getDoc, startAfter, doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import "./styles.css"; // Import custom styling
import { auth } from "../../firebase";
import { useAuthState } from 'react-firebase-hooks/auth';
import defaultPic from '../../assets/user.jpg'
import { useNavigate } from "react-router-dom";
import { FcLike } from "react-icons/fc";
import { IoShareSocial } from "react-icons/io5";
import ShareModal from "../ShareModal";
import { toast } from "react-toastify";

function Feed() {
  const [posts, setPosts] = useState([]); // Holds post data
  const [lastDoc, setLastDoc] = useState(null); // Tracks last document fetched
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [user] = useAuthState(auth);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [currentShareLink, setCurrentShareLink] = useState("");

  const navigate = useNavigate();

  const POSTS_PER_PAGE = 20; // Number of posts per batch

  // Fetch initial batch of posts
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const postsRef = collection(db, "posts"); // Firestore collection
      let q = query(postsRef, orderBy("createdAt", "desc"), limit(POSTS_PER_PAGE));

      // If there's a last document, start after it for pagination
      if (lastDoc) {
        q = query(postsRef, orderBy("createdAt", "desc"), startAfter(lastDoc), limit(POSTS_PER_PAGE));
      }

      const snapshot = await getDocs(q);
      const newPosts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Filter out duplicates
      setPosts((prevPosts) => {
        const uniquePosts = new Map();
        [...prevPosts, ...newPosts].forEach((post) => {
          uniquePosts.set(post.id, post);
        });
        return Array.from(uniquePosts.values());
      });// Append new posts

      setLastDoc(snapshot.docs[snapshot.docs.length - 1]); // Update last document

      if (snapshot.docs.length < POSTS_PER_PAGE) setHasMore(false); // Stop if no more posts
    } catch (error) {
      toast.error("Error fetching posts: ", error);
    }
    setLoading(false);
  };


  // Infinite Scroll Handler
  const handleScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop + 1 >= document.documentElement.scrollHeight && !loading
    ) {
      fetchPosts();
    }
  };

  // Attach Scroll Event Listener
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastDoc, loading]);

  // Like a post
  const handleLike = async (postId, userId) => {
    const postRef = doc(db, "posts", postId);

    try {
      const postSnap = await getDoc(postRef);

      if (postSnap.exists()) {
        const postData = postSnap.data();
        const currentLikes = postData.likes || []; // Ensure likes is an array

        if (currentLikes.includes(userId)) {
          // User already liked the post, so remove their like
          const updatedLikes = currentLikes.filter((id) => id !== userId);
          await updateDoc(postRef, { likes: updatedLikes });
        } else {
          // User is liking the post
          const updatedLikes = [...currentLikes, userId];
          await updateDoc(postRef, { likes: updatedLikes });
        }

        // Update the UI
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? { ...post, likes: currentLikes.includes(userId) ? currentLikes.filter((id) => id !== userId) : [...currentLikes, userId] }
              : post
          )
        );
      }
    } catch (error) {
      toast.error("Error updating likes: ", error);
    }
  };

  const openShareModal = (postId) => {
    setCurrentShareLink(`https://www.example.com/post/${postId}`); // Replace with your actual post link
    setIsShareModalOpen(true);
  };

  const closeShareModal = () => {
    setIsShareModalOpen(false);
    setCurrentShareLink("");
  };

  return (
    <div className="feed">
      {
        user &&
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <img
            src={user.photoURL ? user.photoURL : defaultPic}
            style={{ borderRadius: "50%", height: "4rem", width: "4rem", cursor: "pointer" }}
            alt="pic"
            onClick={(() => navigate('/profilePage'))}
          />
          <div className="userName">
            <p style={{ fontSize: "0.9rem", fontWeight: "400", color: "darkgray" }}>Welcome Back</p>
            <p style={{ fontSize: "1.4rem", fontWeight: "600" }}>{user.displayName}</p>
          </div>
        </div>
      }
      <h2>Feeds</h2>
      {posts.map((post) => (
        <div key={post.id} className="post-card">
          <div className="post-header">
            <img src={post.userPhoto} alt="user" className="user-photo" />
            <div>
              <h4>{post.userName}</h4>
              <p>{new Date(post.createdAt?.seconds * 1000).toLocaleString()}</p>
            </div>
          </div>
          <p>{post.text}</p>

          {/* Render images */}
          <div className="post-media slideshow-container">
            {post.images && post.images.map((img, index) => (
              <div key={index} className="slide">
                <img src={img} alt="post" />
              </div>
            ))}
            {post.videos && post.videos.map((vid, index) => (
              <div key={index} className="slide">
                <video controls src={vid}></video>
              </div>
            ))}
          </div>

          {/* Like and Share buttons */}
          <div className="post-actions">
            <button className="like" onClick={() => handleLike(post.id, user.uid)}>
              <FcLike />
              {post.likes?.includes(user.uid) ? "Unlike" : "Like"} ({post.likes?.length || 0})
            </button>
            <button className="share" onClick={() => openShareModal(post.id)}>
              <IoShareSocial /> Share
            </button>
          </div>

        </div>
      ))}

      {loading && <p>Loading...</p>}
      {!hasMore && <p>No more posts to load</p>}

      <ShareModal isOpen={isShareModalOpen} onClose={closeShareModal} shareLink={currentShareLink} />
    </div>
  );
}

export default Feed;