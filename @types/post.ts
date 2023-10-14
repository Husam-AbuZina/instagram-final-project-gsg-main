export namespace PostNs {
    export interface Post {
        id: number;
        image: string;
        description: string;
        user: string;
        likes: string[];
        createdAt: Date;
    }
}