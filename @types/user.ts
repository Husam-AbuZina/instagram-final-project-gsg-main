import { Comment } from "../src/db/entities/Comment.js";
import { Post } from "../src/db/entities/Post.js";

export namespace UserNS {
    export interface User {
        id: string;
        userName: string;
        email: string;
        password: string;
        posts: Post[];
        likes: string[];
        followers: string[];
        following: string[];
        comments: Comment[];
        shares: string[];
        bio: string;
        avatar: string;
        status: "private" | "public";
        createdAt: Date;
    }
}