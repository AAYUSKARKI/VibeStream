// src/App.jsx
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import VideoUploadForm from './components/VideoUploadForm';
import LoginForm from './components/Login';
import VideoList from './components/Videolist';
import VideoHubRegister from './components/Register';
import { Navbar } from './utils';
import Mychannel from './components/Mychannel';
import ThemeSwitcher from './components/Themeswitcher';
import Likedvideo from './components/Likedvideo'
import Videoplayer from './components/Videoplayer';
function App() {
    return (
        <>
            <Router>
                <ThemeSwitcher/>
                <Navbar/>
                <Routes>
                    <Route path="/upload" element={<VideoUploadForm />} />
                    <Route path="/login" element={<LoginForm />} />
                    <Route path="/register" element={<VideoHubRegister />} />
                    <Route path="/channel/:username" element={<Mychannel/>}/>
                    <Route path="/" element={<VideoList />} />
                    <Route path="/videos/:id" element={<Videoplayer />} />
                    <Route path="/liked-videos" element={<Likedvideo />} />
                </Routes>
            </Router>
        </>
    );
}

export default App;
