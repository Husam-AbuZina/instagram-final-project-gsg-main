export namespace CommentNS {
    export interface Comment {
        id: number;
        content: string;
        post: string;
        user: string;
        createdAt: Date;
    }
}