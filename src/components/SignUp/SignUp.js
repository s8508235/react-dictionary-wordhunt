import React, { useState, useRef } from 'react';
import {
  useHistory,
  useLocation,
} from "react-router-dom";

import { Formik } from 'formik';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import UserForm from '../UserForm/UserForm';
import { UserValidationSchema } from '../../util/UserValidation';
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
  const [openDialog, setOpenDialog] = useState(false);
  const [alertText, setAlertText] = useState('');
  // prevent findDOMNode
  const dialogRef = useRef();
  const history = useHistory();
  const location = useLocation();
  const { from } = location.state || { from: { pathname: "/login" } };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmit = async credientals => {
    const message = await signUpUser(credientals)
      .catch(error => {
        handleOpenDialog();
        setAlertText(error.message);
      });

    if (message) {
      console.log("message:", JSON.stringify(message));
      setAlertText('');
      history.replace(from);
    }
  }

  return (
    <div className="signup-wrapper">
      <h1>Please Sign Up</h1>
      <Formik
        initialValues={{
          username: '',
          password: '',
        }}
        validationSchema={UserValidationSchema}
        onSubmit={async (values) => {
          await handleSubmit({ username: values.username, passwd: values.password });
        }}
      >
        <UserForm />
      </Formik>
      <Dialog
        open={openDialog}
        ref={dialogRef}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Error"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {alertText}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary" autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
