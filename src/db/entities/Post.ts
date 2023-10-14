import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User.js";
import { Comment } from "./Comment.js";

@Entity('posts')
export class Post extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ type: 'text', nullable: false })
    image: string;

    @Column({ type: 'text' })
    description: string;

    @ManyToOne(() => User, user => user.posts)
    user: Partial<User>;

    @Column('simple-array', { nullable: true })
    likes: string[] = [];

    @OneToMany(() => Comment, comment => comment.post, { onDelete: 'CASCADE', eager: true })
    comments: Comment[];

    @Column('simple-array', { nullable: true })
    shares: string[] = [];

    @CreateDateColumn({
        type: 'timestamp',
        default: () => "CURRENT_TIMESTAMP(6)"
    })
    createdAt: Date;
}