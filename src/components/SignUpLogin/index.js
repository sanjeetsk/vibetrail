import React, { useState } from 'react'
import './styles.css'
import { toast } from 'react-toastify';
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db, provider } from '../../firebase';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from "react-icons/fc";
import icon from '../../assets/icon.png'


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
  )
}

export default SignUpLogin
