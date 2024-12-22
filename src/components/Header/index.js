import React, { useEffect } from 'react'
import './styles.css';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';

function Header() {
  const [user, loading, error] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }else{
      navigate('/');
    }
  }, [user, loading, navigate]);


  return (
    <div className='navbar-container'>
      <Navbar />
      <p className='logo'>
        VibeTrail.
      </p>
    </div>
  )
}

export default Header
