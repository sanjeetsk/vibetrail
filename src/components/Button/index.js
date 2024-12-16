import React from 'react'
import './styles.css';

function Button({ text, onClick, blue, loading}) {
  return (
    <div className={blue ? "btn btn-blue" : "btn"} onClick={onClick}>
        {loading ? "Loading..." : text}      
    </div>
  )
}

export default Button