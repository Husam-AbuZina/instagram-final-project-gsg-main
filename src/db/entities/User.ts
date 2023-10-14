import { BaseEntity, BeforeInsert, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import bcrypt from 'bcrypt';
import { Post } from './Post.js';
import { Comment } from './Comment.js';
import { Story } from './Story.js';

@Entity('users')
export class User extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', default: "https://e7.pngegg.com/pngimages/84/165/png-clipart-united-states-avatar-organization-information-user-avatar-service-computer-wallpaper-thumbnail.png" })
    avatar: string;

    @Column({ length: 255, nullable: false })
    userName: string;

    @Column({ nullable: false, unique: true })
    email: string;

    @Column({ length: 500 })
    bio: string;

    @Column({
        type: 'enum', enum: ["private", "public"],
        default: "public",
        comment: 'private: only followers can see posts, public: everyone can see posts'
    })
    status: "private" | "public";

    getLimitedProfileInfo(): Partial<User> {
        if (this.status === 'private') {
            return {
                id: this.id,
                email: this.email,
                userName: this.userName,
                password: this.password,
                avatar: this.avatar,
                bio: this.bio,
                status: this.status,
                followers: this.followers,
                following: this.following,
            };
        } else {
            // For public profiles, return all fields
            return this;
        }
    }

    getBasicProfileInfo(): Partial<User> {
        return {
            id: this.id,
            email: this.email,
            userName: this.userName,
            password: this.password,
            avatar: this.avatar,
            bio: this.bio,
            status: this.status,
            followers: this.followers,
            following: this.following,
        };
    }


    @BeforeInsert()
    async hashPassword() {
        if (this.password) {
            this.password = await bcrypt.hash(this.password, 10);
        }
    }
    @Column({ nullable: false })
    password: string;

    @OneToMany(() => Post, post => post.user, { eager: true, onDelete: 'CASCADE' })
    posts: Post[];

    @OneToMany(() => Story, story => story.user, { onDelete: 'CASCADE' })
    stories: Story[];

    @Column('simple-array', { nullable: true })
    likes: string[] = [];

    @OneToMany(() => Comment, comment => comment.user)
    comments: Comment[];

    @Column('simple-array', { nullable: true })
    shares: string[] = [];

    @Column('simple-array', { nullable: true })
    bookmarks: number[] = [];

    @Column('simple-array', { nullable: true })
    followers: string[] = [];

    @Column('simple-array', { nullable: true })
    following: string[] = [];

    @CreateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP(6)'
    })
    createdAt: Date;
}
