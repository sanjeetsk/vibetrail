import React, { useState } from 'react'
import Input from '../Input'
import Button from '../Button';
import './styles.css'
import { toast } from 'react-toastify';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db, provider } from '../../firebase';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';


function SignUpLogin() {
  const [fullname, setFullName] = useState();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [cpassword, setCpassword] = useState();
  const [loading, setLoading] = useState(false);
  const [loginForm, setLoginForm] = useState(false);

  const navigate = useNavigate();

  function handleEmailSignUp() {
    if (email === '' || email.indexOf('@') === -1 || email.indexOf('.') === -1) {
      toast.error("Please enter valid email!")
      setLoading(false)
    }
    if (password.length < 6) {
      toast.error('Your password must be at least six characters long!')
      setLoading(false)
    }
    if (cpassword !== password) {
      toast.error("Password and Confirm Password should match!");
      setLoading(false);
    }
    else if (fullname !== "" && email !== "" && password.length >= 6 && cpassword === password) {
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          toast.success("success")
          setLoading(false);
          setFullName("");
          setEmail("");
          setPassword("");
          setCpassword("");
          createDoc(user);
          setLoginForm(true);
          // ...
        })
        .catch((error) => {
          const errorMessage = error.message;
          toast.error(errorMessage);
          setLoading(false);
          // ..
        });
    }
    else {
      toast.error("All field are mandatory!");
      setLoading(false);
    }
  }

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
          name: user.displayName ? user.displayName : fullname,
          email: user.email ? user.email : email,
          photoURL: user.photoURL ? user.photoURL : "",
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
    try{
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
    catch(e){
      toast.error(e.message);
    }
  }

  return (
    <div className='signup-wrapper'>
      <h2 className='title'>SignUp on<span style={{ color: "var(--theme)" }}> vibeTrail.</span> </h2>
      <form>
        <Input
          label='Full Name'
          type="text"
          state={fullname}
          setState={setFullName}
          placeholder='John Doe'
        />
        <Input
          label='Email'
          type="email"
          state={email}
          setState={setEmail}
          placeholder='Example@gmail.com'
        />
        <Input
          label='Password'
          type="password"
          state={password}
          setState={setPassword}
          placeholder='Example@123'
        />
        <Input
          label='Confirm Password'
          type="password"
          state={cpassword}
          setState={setCpassword}
          placeholder='Example@123'
        />
        <Button text={"SignUp Using Email and Password"} onClick={handleEmailSignUp} />
        <p className='p-login'>or</p>
        <Button text={"SignUp Using Google"} onClick={handleGoogleLogin} blue={"blue"} />
      </form>
    </div>
  )
}

export default SignUpLogin
