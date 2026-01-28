import React, { useState } from 'react'
import './Login.css'
import assets from '../../assets/assets'
import { signup, login, resetPass, googleSignIn } from '../../config/firebase'

const Login = () => {

    const [currentState, setCurrentState] = useState('Sign Up');
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("")

    const onSubmitHandler = (event) => {
        event.preventDefault();
        if (currentState === "Sign Up") {
            signup(username, email, password)
        }
        else {
            login(email, password);
        }
    }

    return (
        <div className='login'>
            <img src={assets.logo_big} alt="" className='logo' />
            <form onSubmit={onSubmitHandler} className='login-form'>
                <h2>
                    {currentState}
                </h2>
                {currentState === "Sign Up" ? <input onChange={(e) => setUsername(e.target.value)} value={username} type="text" className="form-input" placeholder='user name' required /> : null}
                <input onChange={(e) => setEmail(e.target.value)} value={email} type="email" className="form-input" placeholder='Email address' required />
                <input onChange={(e) => setPassword(e.target.value)} value={password} type="password" className="form-input" placeholder='Password' />
                <button type='submit'> {currentState === "Sign Up" ? "Create Account" : "Login Now"}</button>
                <div className='login-term'>
                    <input type="checkbox" />
                    <p>Agree to the terms of use & Privacy Policy</p>
                </div>
                <div className='login-forgot'>

                    {
                        currentState === "Sign Up" ?
                            <p className="login-toggle">Already have an Account <span onClick={() => setCurrentState("Login")}>Login here</span></p>
                            :
                            <p className="login-toggle">Create an Account <span onClick={() => setCurrentState("Sign Up")}>click here</span></p>
                    }
                    {
                        currentState === "Login" ? <p className="login-toggle">Forgot Password <span onClick={() => resetPass(email)}>reset here</span></p> : null

                    }

                </div>
            </form>
            <div className='login-google'>
                <button type='button' onClick={googleSignIn} className='google-signin-btn'>
                    <img src={assets.google_icon} alt="Google" /> Sign in with Google
                </button>
            </div>
        </div>
    )
}

export default Login