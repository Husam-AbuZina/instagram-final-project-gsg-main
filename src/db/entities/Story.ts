import { BaseEntity, Entity, Column, CreateDateColumn, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { User } from "./User.js";

@Entity('stories')
export class Story extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ type: 'text', nullable: true })
    image: string;

    @Column({ type: 'text' })
    caption: string;

    @Column({ type: 'simple-array', nullable: true })
    likes: string[] = [];

    @Column({ type: 'simple-array', nullable: true })
    views: string[] = [];

    @ManyToOne(() => User, user => user.stories)
    user: Partial<User>;

    getBasicInfo(): StoryBasicInfo {
        return {
            id: this.id,
            image: this.image,
            caption: this.caption,
            user: this.user,
        };
    }

    @CreateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP(6)'
    })
    expiryDate: Date;

    @CreateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP(6)'
    })
    createdAt: Date;
}

interface StoryBasicInfo {
    id: number;
    image: string;
    caption: string;
    user: Partial<User>;
}