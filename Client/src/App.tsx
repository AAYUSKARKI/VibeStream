// src/App.jsx
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import VideoUploadForm from './components/VideoUploadForm';
import LoginForm from './components/Login';
import VideoList from './components/Videolist';
import VideoHubRegister from './components/Register';
import { Navbar } from './utils';
import Mychannel from './components/Mychannel';
import ThemeSwitcher from './components/Themeswitcher';
import { Suspense, lazy, useEffect, useState } from 'react';
import Loader from './components/Loader';
import Likedvideo from './components/Likedvideo'


const Videoplayer = lazy(() => import('./components/Videoplayer'));
const Subscribedchannel = lazy(() => import('./components/Subscribedchannel'));
const Watchhistory = lazy(() => import('./components/Watchhistory'));

function App() {

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setLoading(false);
        }, 3000);
    }, []);

    if (loading) {
        return <Loader />;
    }


    return (
        <>
            <Router>
                <ThemeSwitcher/>
                <Navbar/>
                <Suspense fallback={<Loader />}>
                <Routes>
                    <Route path="/upload" element={<VideoUploadForm />} />
                    <Route path="/login" element={<LoginForm />} />
                    <Route path="/register" element={<VideoHubRegister />} />
                    <Route path="/channel/:username" element={<Mychannel/>}/>
                    <Route path="/" element={<VideoList />} />
                    <Route path="/videos/:id" element={<Videoplayer />} />
                    <Route path="/liked-videos" element={<Likedvideo />} />
                    <Route path="/subscriptions" element={<Subscribedchannel />} />
                    <Route path="/history" element={<Watchhistory />} />
                </Routes>
                </Suspense>
            </Router>
        </>
    );
}

export default App;
