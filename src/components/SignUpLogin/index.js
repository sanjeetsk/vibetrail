import React, { useState } from 'react';
import './styles.css';
import { toast } from 'react-toastify';
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db, provider } from '../../firebase';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from "react-icons/fc";
import icon from '../../assets/icon.png';
import img1 from '../../assets/img1.jpg';
import img2 from '../../assets/img2.jpg';
import img3 from '../../assets/img3.jpg';
import img4 from '../../assets/img4.jpg';
import img5 from '../../assets/img5.jpg';
import img6 from '../../assets/img6.jpg';
import img7 from '../../assets/img7.jpg';
import img8 from '../../assets/img8.jpg';
import img9 from '../../assets/img9.jpg';


function SignUpLogin() {
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function createDoc(user) {
    // Make sure that doc with the same uid doesn't exist
    // Create a doc
    setLoading(true);
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const userData = await getDoc(userRef)
    if (!userData.exists()) {
      try {
        await setDoc(doc(db, "users", user.uid), {
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          createdAt: new Date(),
        });
        toast.success("Doc created!");
        setLoading(false);
      }
      catch (e) {
        toast.error(e.message);
        setLoading(false);
      }
    }
    else {
      toast.error("Docs already exists");
      setLoading("false");
    }
  }

  function handleGoogleLogin() {
    setLoading(true);
    try {
      signInWithPopup(auth, provider)
        .then((result) => {
          // This gives you a Google Access Token. You can use it to access the Google API.
          const credential = GoogleAuthProvider.credentialFromResult(result);
          const token = credential.accessToken;
          // The signed-in user info.
          const user = result.user;
          // IdP data available using getAdditionalUserInfo(result)
          // ...
          toast.success("success")
          setLoading(false);
          createDoc(user);
          setTimeout((() => navigate('/dashboard')), 1500);
        })
        .catch((error) => {
          // Handle Errors here.
          const errorCode = error.code;
          const errorMessage = error.message;
          // The email of the user's account used.
          const email = error.customData.email;
          // The AuthCredential type that was used.
          const credential = GoogleAuthProvider.credentialFromError(error);
          // ...
          toast.error(errorMessage, credential, email);
          setLoading(false);
        });
    }
    catch (e) {
      toast.error(e.message);
    }
  }

  return (
    <div className="login-page">
      <div className="image-grid">
        <img src={img1} alt="image1" />
        <img src={img2} alt="image2" />
        <img src={img3} alt="image3" />
        <img src={img4} alt="image4" />
        <img src={img5} alt="image5" />
        <img src={img6} alt="image6" />
        <img src={img7} alt="image7" />
        <img src={img8} alt="image8" />
        <img src={img9} alt="image9" />
      </div>
      <div className='signup-wrapper'>
        <div className="title-div">
          <img src={icon} alt="icon" className="icon" />
          <h2 className="title">
            <span style={{ color: "var(--theme)" }}>vibeTrail.</span>
          </h2>
        </div>


        <form>
          <div className='btn' onClick={handleGoogleLogin}>
            <FcGoogle style={{ margin: '5px', fontSize: '1.5rem' }} />
            Continue with Google
          </div>
        </form>
      </div>
    </div>
  )
}

export default SignUpLogin
