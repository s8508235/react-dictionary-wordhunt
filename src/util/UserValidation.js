import * as yup from 'yup';

export const UserValidationSchema = yup.object({
    username: yup
        .string('Enter your user name')
        .min(4, 'At least 4 character user name')
        .required('User name is required'),
    password: yup
        .string('Enter your password')
        .min(8, 'Password should be of minimum 8 characters length')
        .required('Password is required'),
});
