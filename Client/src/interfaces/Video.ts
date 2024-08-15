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
