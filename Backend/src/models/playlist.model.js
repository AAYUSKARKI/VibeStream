import mongoose, { Schema } from 'mongoose'


const Playlistschema = new Schema({
    title: {
        type: String,
        required: true,
        unique: [true, "Playlist already exists"],
        index: true
    },
    videos: [{
        type: Schema.Types.ObjectId,
        ref: "Video"
    }],
    owner:{
        type: Schema.Types.ObjectId,
        ref: "User",
        index: true
    }
},
    { timestamps: true }

)





export const Playlist = mongoose.model("Playlist", Playlistschema)  