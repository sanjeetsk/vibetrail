import React from 'react'
import Header from '../components/Header'
import Feed from '../components/Feed'
import { IoMdAddCircle } from "react-icons/io";
import './styles.css' // Import the CSS for styling
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <div className="dashboard-container">
        <div className="feed-container">
          <Feed />
        </div>
        <div className="floating-button" onClick={() => navigate('/createPost')}>
          <IoMdAddCircle size={50} />
        </div>
      </div>
    </>

  )
}

export default Dashboard
