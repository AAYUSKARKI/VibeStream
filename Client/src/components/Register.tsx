import { useState} from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button, Typography, Card, CardContent, CircularProgress, Alert } from '@mui/material';
import { useDropzone, Accept } from 'react-dropzone';
import axios from 'axios';

const VideoHubRegister = () => {
    const { control, handleSubmit, setValue, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const onDrop = (acceptedFiles: File[], fieldName: string) => {
        setValue(fieldName, acceptedFiles[0]);
    };

    const { getRootProps: getAvatarRootProps, getInputProps: getAvatarInputProps } = useDropzone({
        accept: { 'image/*': [] } as Accept,
        onDrop: (acceptedFiles) => onDrop(acceptedFiles, 'avatar'),
    });

    const { getRootProps: getCoverRootProps, getInputProps: getCoverInputProps } = useDropzone({
        accept: { 'image/*': [] } as Accept,
        onDrop: (acceptedFiles) => onDrop(acceptedFiles, 'coverImage'),
    });

    // Function to generate avatar
    const generateAvatar = (username: string) => {
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = '#2d3748'; // Dark background
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.font = '128px Arial';
            ctx.fillStyle = '#ffffff'; // White text
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(username.charAt(0).toUpperCase(), canvas.width / 2, canvas.height / 2);

            return canvas.toDataURL('image/png');
        }
        return null;
    };

    const onSubmit = async (data: any) => {
        try {
            setLoading(true);
            setError(null);

            // Generate avatar if not provided
            if (!data.avatar) {
                const avatarDataUrl = generateAvatar(data.username);
                if (avatarDataUrl) {
                    const blob = await fetch(avatarDataUrl).then(res => res.blob());
                    data.avatar = new File([blob], 'avatar.png', { type: 'image/png' });
                }
            }

            // Prepare form data
            const formData = new FormData();
            formData.append('fullname', data.fullname);
            formData.append('email', data.email);
            formData.append('username', data.username);
            formData.append('password', data.password);
            if (data.avatar) formData.append('avatar', data.avatar);
            if (data.coverImage) formData.append('coverImage', data.coverImage);

            // Submit form data
            await axios.post('http://localhost:7000/api/v1/users/register', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        console.log(`Upload Progress: ${progress}%`);
                    } else {
                        console.log(`Upload Progress: Unable to determine total size.`);
                    }
                },
                
            });

            setSuccess(true);
        } catch (error: any) {
            setError(error.response?.data?.message || 'Something went wrong!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 dark:bg-gray-950">
            <Card>
                <CardContent>
                    <Typography variant="h4" gutterBottom>
                        Register on VideoHub
                    </Typography>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <Controller
                            name="fullname"
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                                <TextField {...field} label="Full Name" fullWidth required error={!!errors.fullname} />
                            )}
                        />
                        <Controller
                            name="email"
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                                <TextField {...field} label="Email" fullWidth required error={!!errors.email} />
                            )}
                        />
                        <Controller
                            name="username"
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                                <TextField {...field} label="Username" fullWidth required error={!!errors.username} />
                            )}
                        />
                        <Controller
                            name="password"
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                                <TextField {...field} label="Password" type="password" fullWidth required error={!!errors.password} />
                            )}
                        />
                        <div {...getAvatarRootProps()} className="border-dashed border-2 border-gray-300 p-4 text-center cursor-pointer">
                            <input {...getAvatarInputProps()} />
                            <Typography>Drag 'n' drop an avatar image here, or click to select one</Typography>
                        </div>
                        <div {...getCoverRootProps()} className="border-dashed border-2 border-gray-300 p-4 text-center cursor-pointer">
                            <input {...getCoverInputProps()} />
                            <Typography>Drag 'n' drop a cover image here, or click to select one (optional)</Typography>
                        </div>
                        <Button type="submit" variant="contained" color="primary" fullWidth>
                            {loading ? <CircularProgress size={24} /> : 'Register'}
                        </Button>
                        {error && <Alert severity="error">{error}</Alert>}
                        {success && <Alert severity="success">Registration successful!</Alert>}
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default VideoHubRegister;
