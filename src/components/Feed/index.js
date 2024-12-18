import React, { useState, useEffect } from "react";
import { db } from "../../firebase"; // Import Firebase setup
import { collection, query, orderBy, limit, getDocs, startAfter } from "firebase/firestore";
import "./styles.css"; // Import custom styling
import { auth } from "../../firebase";
import { useAuthState } from 'react-firebase-hooks/auth';
import userpic from '../../assets/user.jpg'

function Feed() {
  const [posts, setPosts] = useState([]); // Holds post data
  const [lastDoc, setLastDoc] = useState(null); // Tracks last document fetched
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [user] = useAuthState(auth);

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
      console.error("Error fetching posts: ", error);
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

  return (
    <div className="feed">
      {
        user &&
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <img
            src={user.photoURL ? user.photoURL : userpic}
            style={{ borderRadius: "50%", height: "4rem", width: "4rem" }}
            alt="pic"
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
          <div className="post-media">
            {post.images && post.images.map((img, index) => <img key={index} src={img} alt="post" />)}
            {post.video && <video controls src={post.video}></video>}
          </div>
        </div>
      ))}

      {loading && <p>Loading...</p>}
      {!hasMore && <p>No more posts to load</p>}
    </div>
  );
}

export default Feed;