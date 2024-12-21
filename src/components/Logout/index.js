import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { toast } from 'react-toastify';
import { auth } from '../../firebase';

function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    // Automatically call handleLogout when the component mounts
    handleLogout();
  }, []);

  async function handleLogout() {
    try {
      await signOut(auth);
      toast.success('Signed out successfully!');
      navigate('/'); // Redirect to the home page or login page
    } catch (error) {
      toast.error(`Error signing out: ${error.message}`);
    }
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>Logging out...</h2>
    </div>
  );
}

export default Logout;
