export interface IVideo {
    _id: string;
    videofile: string;
    description: string;
    duration: number;
    thumbnail: string;
    title: string;
    views: number;
    ispublished: boolean;
    owner: {
        _id: string;
        username: string;
        avatar: string;
    };
    likesCount?:number;
    createdAt: string;
    updatedAt: string;
}

interface VideoOwner {
    _id: string;
    username: string;
    avatar: string;
    subscribersCount: number;
    isSubscribed: boolean;
}

export interface Video {
    _id: string;
    videofile: string;
    description: string;
    title: string;
    views: number;
    owner: VideoOwner;
    createdAt: string;
    likesCount: number;
    isLiked: boolean;
}