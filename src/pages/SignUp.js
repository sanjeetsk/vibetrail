import React from 'react'
import SignUpLogin from '../components/SignUpLogin'
import Header from '../components/Header'

function SignUp() {
  return (
    <div>
      <Header />
      <div className='wrapper'>
        <SignUpLogin />
      </div>
    </div>
  )
}

export default SignUp
