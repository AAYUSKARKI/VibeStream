import { Apierror } from "../utils/apierror.js";
import { Apiresponse } from "../utils/apiresponse.js";
import { asynchandler} from "../utils/asynchandler.js";
import mongoose from "mongoose";
import { client} from "../index.js";
import { Playlist } from "../models/playlist.model.js";

const createPlaylist = asynchandler(async (req, res) => {
    const { title,videoId } = req.body;
    const owner = req.user._id;
    if (!title) {
        throw new Apierror(400, "Title is required");
    }

    const playlist = await Playlist.create({
        title,
        owner,
        videos: videoId ? [videoId] : [],
    });

    if (!playlist) {
        throw new Apierror(400, "Playlist not created");
    }

    return res.status(200).json(new Apiresponse(200, playlist, "Playlist created successfully"));
});

const addtoPlaylist = asynchandler(async (req, res) => {
    const { playlistId, videoId } = req.body;
    const owner = req.user._id;

    if (!mongoose.isValidObjectId(playlistId) || !mongoose.isValidObjectId(videoId)) {
        throw new Apierror(400, "Invalid playlist or video ID");
    }

    const playlist = await Playlist.findOne({ _id: playlistId, owner });
    if (!playlist) {
        throw new Apierror(404, "Playlist not found");
    }

    if (playlist.videos.includes(videoId)) {
        throw new Apierror(400, "Video already in playlist");
    }

    playlist.videos.push(videoId);
    await playlist.save();

    return res.status(200).json(new Apiresponse(200, playlist, "Video added to playlist successfully"));

});


const getPlaylist = asynchandler(async (req, res) => {
    const { playlistId } = req.params;
    const owner = req.user._id;

    if (!mongoose.isValidObjectId(playlistId)) {
        throw new Apierror(400, "Invalid playlist ID");
    }

    const playlist = await Playlist.findOne({ _id: playlistId, owner }).populate("videos");
    if (!playlist) {
        throw new Apierror(404, "Playlist not found");
    }

    return res.status(200).json(new Apiresponse(200, playlist, "Playlist fetched successfully"));
});


const getmyPlaylist = asynchandler(async (req, res) => {
    const userId = req.user._id.toString(); // Ensure user ID is a string
    const cachedplaylist = await client.get(`${userId}-myplaylist`).catch(err => {
        console.error('Redis Get Error:', err);
        return null;
    });
    if (cachedplaylist) {
        return res.status(200).json(new Apiresponse(200, JSON.parse(cachedplaylist), "Playlist fetched successfully"));
    }
    const playlists = await Playlist.find({ owner: req.user._id }).populate("videos");
    client.set(`${userId}-myplaylist`, JSON.stringify(playlists), 'EX', 3600).catch(err => console.error('Redis Set Error:', err));
    return res.status(200).json(new Apiresponse(200, playlists, "Playlist fetched successfully"));
});


export { createPlaylist, addtoPlaylist, getPlaylist, getmyPlaylist };