import { BaseEntity, CreateDateColumn, Entity, ManyToOne, Column, PrimaryGeneratedColumn } from "typeorm";
import { Post } from "./Post.js";
import { User } from "./User.js";

@Entity('comments')
export class Comment extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column('text')
    content: string;

    @Column('simple-array', { nullable: true })
    likes: string[] = [];

    @ManyToOne(() => User, user => user.comments)
    user: Partial<User>;

    @ManyToOne(() => Post, post => post.comments)
    post: Partial<Post>;

    @CreateDateColumn({
        type: 'timestamp',
        default: () => "CURRENT_TIMESTAMP(6)"
    })
    createdAt: Date;
}