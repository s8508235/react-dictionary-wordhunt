import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
} from "react-router-dom";

import "./App.css";
import { ProvideAuth, PrivateRoute } from './components/Auth/Auth';
import Login from './components/Login/Login';
import SignUp from './components/SignUp/SignUp';
import OnlineDictionary from "./components/OnlineDictionary/OnlineDictionary";

function App() {
  return (
    <ProvideAuth>
      <Router>
        <Switch>
          <Route path="/" exact component={OnlineDictionary} />
          <Route path="/public">
            <PublicPage />
          </Route>
          <Route path="/login" exact component={Login} />
          <Route path="/signup" exact component={SignUp} />
          <PrivateRoute path="/protected">
            <ProtectedPage />
          </PrivateRoute>
        </Switch>
      </Router>
    </ProvideAuth >
  );
}

function PublicPage() {
  return <h3>Public</h3>;
}

function ProtectedPage() {
  return <><h3>Protected</h3>
  <Link to="/">Back</Link></>;
}

export default App;
