import mongoose,{Schema} from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate'

const videoschema = new Schema(
    {
        videofile:{
            type:String,   //cloudinary 
            required:true,
        },
       description:{
            type:String,   
            required:true,
        },
        duration:{
            type:Number,
            required:true,
        },
        thumbnail:{
            type:String,   //cloudinary 
            required:true,
        },
        title:{
            type:String,   
            required:true,
        },
        views:{
            type:Number,
            default: 0
        },
        ispublished:{
            type: Boolean,
            default: true
        },
        owner:{
            type: Schema.Types.ObjectId,
            ref:"User",
            index: true
        },
        category:{
            type:String,
            index: true
        },
        tags:{
            type:[String],
            index: true           
        }
},
{
    timestamps:true
}
)

videoschema.index({ "title": "text", "description": "text", "category": "text" });

videoschema.plugin(mongooseAggregatePaginate)


export const Video = mongoose.model("Video",videoschema)