import React from 'react'
import Header from '../components/Header'
import Feed from '../components/Feed'
import { IoMdAddCircle } from "react-icons/io";
import './styles.css' // Import the CSS for styling

function Dashboard() {
  return (
    <>
      <Header />
      <div className="dashboard-container">
        <div className="feed-container">
          <Feed />
        </div>
        <div className="floating-button">
          <IoMdAddCircle size={50} />
        </div>
      </div>
    </>

  )
}

export default Dashboard
