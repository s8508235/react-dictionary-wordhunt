import React, { createContext, useState, useContext } from "react";
import {
    Route,
    Redirect,
} from "react-router-dom";

const authContext = createContext();

function ProvideAuth({ children }) {
    const auth = useProvideAuth();
    return (
        <authContext.Provider value={auth}>
            {children}
        </authContext.Provider>
    );
}

function useAuth() {
    return useContext(authContext);
}

const WrongPasswd = new Error('wrong password');
const NoSuchUser = new Error('no such user');

async function loginUser(credentials) {
    return fetch(`${process.env.REACT_APP_BACKEND_ENDPOINT}/login`, {
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
        .catch(err => console.error("login error", err))
        .then(res => {
            if (res.status === 200) {
                return res.json();
            } else if (res.status === 400) {
                throw WrongPasswd;
            } else if (res.status === 404) {
                throw NoSuchUser;
            }
        })
        .then(response => {
            console.log('Success:', response);
            return response;
        })
}

async function logOutUser() {
    return fetch(`${process.env.REACT_APP_BACKEND_ENDPOINT}/logout`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': "*",
            'Access-Control-Allow-Headers': "*",
            'Access-Control-Allow-Methods': "GET",
        },
        mode: 'cors',
    })
        .catch(err => console.error("logout error", err))
        .then(res => {
            if (res.status === 200) {
                return res.json();
            }
        })
        .then(response => {
            console.log('Success:', response);
            return;
        })
}

function useProvideAuth() {
    const [user, setUser] = useState(null);

    const signIn = async (credentials) => {
        const token = await loginUser(credentials).then(token => {
            setUser(credentials.username);
            return token;
        })

        return token;
    };

    const signOut = async (callbackFunc) => {
        return await logOutUser().then(() => {
            setUser(null);
            callbackFunc();
        });
    };

    return {
        user,
        signIn,
        signOut
    };
}

// A wrapper for <Route> that redirects to the login
// screen if you're not yet authenticated.
function PrivateRoute({ children, ...rest }) {
    const auth = useAuth();
    console.log("private route");
    return (
        <Route
            {...rest}
            render={({ location }) =>
                auth.user ? (
                    children
                ) : (
                    <Redirect
                        to={{
                            pathname: "/login",
                            state: { from: location }
                        }}
                    />
                )
            }
        />
    );
}

export { ProvideAuth, useAuth, PrivateRoute };
