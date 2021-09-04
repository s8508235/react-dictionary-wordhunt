import React, { useState } from 'react';
import {
  useHistory,
  useLocation,
} from "react-router-dom";

import './SignUp.css';
async function signUpUser(credentials) {
  return fetch(`${process.env.REACT_APP_BACKEND_ENDPOINT}/signup`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': "*",
      'Access-Control-Allow-Headers': "*",
      'Access-Control-Allow-Methods': "POST",
    },
    mode: 'cors',
    body: JSON.stringify(credentials),
  })
    .catch(err => console.error("signup error", err))
    .then(res => {
      if (res.status === 200) {
        return res.json();
      }
        throw new Error("something went wrong")
    })
    .then(response => {
      return response;
    })
}

export default function SignUp() {
  const [username, setUserName] = useState();
  const [passwd, setPasswd] = useState();
  const [alertText, setAlertText] = useState('');
  const history = useHistory();
  const location = useLocation();
  const { from } = location.state || { from: { pathname: "/login" } };

  const handleSubmit = async e => {
    e.preventDefault();
    // try {
    const message = await signUpUser({
      username,
      passwd
    })
      .catch(error => {
        setAlertText(error.message);
      })
    if (message) {
      console.log('Success:', message);
      setAlertText('');
      history.replace(from);
    }
  }

  return (
    <div className="signup-wrapper">
      <h1>Please Sign Up</h1>
      <form onSubmit={handleSubmit}>
        <label>
          <p>Username</p>
          <input type="text" onChange={e => setUserName(e.target.value)} />
        </label>
        <label>
          <p>Password</p>
          <input type="password" onChange={e => setPasswd(e.target.value)} />
        </label>
        <div>
          <button type="submit">Submit</button>
        </div>
        {(alertText !== '') &&
          (<div>
            {alertText}
          </div>
          )
        }
      </form>
    </div>
  )
}
