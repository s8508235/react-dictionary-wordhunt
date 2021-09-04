import React, { useState } from 'react';

import {
  useHistory,
  useLocation,
  Link,
} from "react-router-dom";

import { useAuth } from '../Auth/Auth';
import './Login.css';


export default function Login() {
  const [username, setUserName] = useState();
  const [passwd, setPasswd] = useState();
  const [alertText, setAlertText] = useState('')

  const history = useHistory();
  const location = useLocation();
  const auth = useAuth();
  const { from } = location.state || { from: { pathname: "/" } };
  const handleSubmit = async e => {
    e.preventDefault();

    const message = await auth.signIn({
      username,
      passwd
    }).catch(error => {
      setAlertText(error.message);
    })

    if (message) {
      console.log("message:", JSON.stringify(message));
      setAlertText('');
      history.replace(from);
    }
  }

  return (
    <div className="login-wrapper">
      <h1>Please Log In</h1>
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
      <Link to="/signup">Not register yet?</Link>
    </div>
  )
}
