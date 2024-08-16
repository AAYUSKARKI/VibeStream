import mongoose, { Schema } from 'mongoose'

const Subscriptionschema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId,
        ref: "User",
        index: true
    },
    channel: {
        type: Schema.Types.ObjectId,
        ref: "User",
        index: true
    }
},  
    {timestamps:true}
    
    )

    export const Subscription = mongoose.model("Subscription",Subscriptionschema)  





















    