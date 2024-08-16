import mongoose, { Schema } from 'mongoose'

const likeschema = new Schema({
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video",
        index: true
    },
    comment: {
        type: Schema.Types.ObjectId,
        ref: "comment"
    },
    tweet:{
        type: Schema.Types.ObjectId,
        ref: "Tweet"
    },
    likedBy:{
        type: Schema.Types.ObjectId,
        ref: "User",
        index: true
    }
},  
    {timestamps:true}
    
    )




export const like = mongoose.model("like",likeschema)  