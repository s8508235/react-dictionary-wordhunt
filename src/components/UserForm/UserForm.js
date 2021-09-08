import React from 'react';
// import PropTypes from 'prop-types';

import { useFormikContext } from 'formik';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import './UserForm.css';

const UserForm = () => {
    const { values, touched, errors, handleSubmit, handleChange } = useFormikContext();

    return (
        <form onSubmit={handleSubmit}>
            <TextField
                fullWidth
                id="username"
                name="username"
                label="username"
                value={values.username}
                onChange={handleChange}
                error={touched.username && Boolean(errors.username)}
                helperText={touched.username && errors.username}
            />
            <TextField
                fullWidth
                id="password"
                name="password"
                label="Password"
                type="password"
                value={values.password}
                onChange={handleChange}
                error={touched.password && Boolean(errors.password)}
                helperText={touched.password && errors.password}
            />
            <Button color="primary" variant="contained" fullWidth type="submit">
                Submit
            </Button>
        </form>
    );
};

export default UserForm;
