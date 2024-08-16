import mongoose from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import {Apiresponse} from "../utils/apiresponse.js";
import {Apierror} from "../utils/apierror.js";
import {asynchandler} from "../utils/asynchandler.js"
import {client} from '../index.js'

const createSubscription = asynchandler(async (req, res) => {
    const { channelid } = req.body;
    const subscriber = req.user._id;

    if (!channelid) {
        throw new Apierror(400, "Channel ID is required");
    }

    // Check if the subscription already exists
    const existingSubscription = await Subscription.findOne({ channel: channelid, subscriber });

    if (existingSubscription) {
        // If it exists, remove it (unsubscribe)
        await Subscription.findByIdAndDelete({ _id: existingSubscription._id });
        return res.status(200).json(new Apiresponse(200, null, "Channel unsubscribed successfully"));
    }

    // If it doesn't exist, create a new subscription (subscribe)
    const newSubscription = await Subscription.create({
        channel: channelid,
        subscriber
    });

    if (!newSubscription) {
        throw new Apierror(500, "Failed to subscribe to channel");
    }

    return res.status(201).json(new Apiresponse(201, newSubscription, "Channel subscribed successfully"));
});

const getSubscribedchannel = asynchandler(async (req, res) => {
    console.log('aayus')
    const subscriber = req.user._id.toString();

    // Check if the subscribed channels are in the cache
    const cachedvideos = await client.get(`${subscriber}-subscription`).catch(err => {
        console.error('Redis Get Error:', err);
        return null;
    });

    if (cachedvideos) {
        return res.status(200).json(new Apiresponse(200, JSON.parse(cachedvideos), "Videos fetched successfully"));
    }
        console.log(cachedvideos)

        // If data is not in the cache, fetch from the database
        try {
            console.log('inside try')
            const subscribedChannels = await Subscription.aggregate([
                { $match: { subscriber: new mongoose.Types.ObjectId(req.user._id) } },
                {
                    $lookup: {
                        from: "users",
                        localField: "channel",
                        foreignField: "_id",
                        as: 'SubscribedChannels'
                    }
                },
                { $unwind: "$SubscribedChannels" },
                {
                    $project: {
                        _id: 0,
                        channelId: "$SubscribedChannels._id",
                        username: "$SubscribedChannels.username",
                        avatar: "$SubscribedChannels.avatar"
                    }
                }
            ]);

            if (subscribedChannels.length === 0) {
                return res.status(200).json(new Apiresponse(200, [], "No subscribed channels found"));
            }
           console.log('karki')
            // Cache the result for 1 hour
            client.set(`${subscriber}-subscription`,JSON.stringify(subscribedChannels),'EX',3600);

            return res.status(200).json(new Apiresponse(200, subscribedChannels, "Subscribed channels fetched successfully"));

        } catch (error) {
            throw new Apierror(500, `Error fetching subscribed channels: ${error.message}`);
        }
    });

export {createSubscription,getSubscribedchannel}