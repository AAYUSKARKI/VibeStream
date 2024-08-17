import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { RootState,AppDispatch } from '../redux/store';
import { loginUser } from '../redux/authslice';
import { TextField, Button, IconButton, InputAdornment, Typography, Card, CardContent, CircularProgress, Alert } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import Cookies from "js-cookie";
interface LoginFormInputs {
    identifier: string; // This could be either username or email
    password: string;
}

const LoginForm: React.FC = () => {
    const { control, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>();
    const dispatch = useDispatch<AppDispatch>();
    const authState = useSelector((state: RootState) => state.user);
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleTogglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const onSubmit = async (data: LoginFormInputs) => {
        setErrorMessage(null);
        try {
            const identifierType = data.identifier.includes('@') ? 'email' : 'username';
            const payload = {
                [identifierType]: data.identifier,
                password: data.password,
            };

            const logindata = await dispatch(loginUser(payload)).unwrap();
            // Handle success (e.g., navigate to another page)
            Cookies.set('accesstoken', logindata.accesstoken,{
                secure: true,
                sameSite: "none",
                expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
            });
            console.log(logindata.accesstoken)
            Cookies.set('refreshtoken', logindata.refreshtoken,{
                secure: true,
                sameSite: "none",
                expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
            });
           console.log(logindata)
            
        } catch (error) {
            // If an error occurs, set the error message to display
            setErrorMessage('Invalid username/email or password.');
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-950">
            <Card className="w-full max-w-md p-6">
                <CardContent>
                    <Typography variant="h4" component="h1" className="mb-6 text-center">
                        Login
                    </Typography>
                    {errorMessage && (
                        <Alert severity="error" className="mb-4">
                            {errorMessage}
                        </Alert>
                    )}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <Controller
                            name="identifier"
                            control={control}
                            defaultValue=""
                            rules={{ required: 'Username or Email is required' }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Username or Email"
                                    fullWidth
                                    error={!!errors.identifier}
                                    helperText={errors.identifier?.message}
                                />
                            )}
                        />
                        <Controller
                            name="password"
                            control={control}
                            defaultValue=""
                            rules={{ required: 'Password is required' }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Password"
                                    type={showPassword ? 'text' : 'password'}
                                    fullWidth
                                    error={!!errors.password}
                                    helperText={errors.password?.message}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={handleTogglePasswordVisibility}
                                                    edge="end"
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            )}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            className="mt-4"
                            disabled={authState.loading}
                        >
                            {authState.loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default LoginForm;
