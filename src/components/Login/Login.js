import React, { useState, useRef } from 'react';

import {
  useHistory,
  useLocation,
  Link,
} from "react-router-dom";
import { Formik } from 'formik';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';


import { useAuth } from '../Auth/Auth';
import UserForm from '../UserForm/UserForm';
import { UserValidationSchema } from '../../util/UserValidation';
import './Login.css';


export default function Login() {
  const [openDialog, setOpenDialog] = useState(false);
  const [alertText, setAlertText] = useState('')
  // prevent findDOMNode
  const dialogRef = useRef();
  const history = useHistory();
  const location = useLocation();
  const auth = useAuth();
  const { from } = location.state || { from: { pathname: "/" } };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmit = async credientals => {
    const message = await auth.signIn(credientals)
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
    <div className="login-wrapper">
      <h1>Please Log In</h1>
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
      <Link to="/signup">Not register yet?</Link>
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
    </div >
  )
}
