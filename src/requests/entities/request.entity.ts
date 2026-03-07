import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne} from 'typeorm';
import {RequestStatus} from '../requests.enums';
import {User} from "../../users/entities/user.entity";
import {Skill} from "../../skills/entities/skill.entity";

@Entity('requests')
export class Request {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => User)
    sender: User;

    @ManyToOne(() => User)
    receiver: User;

    @Column({
        type: 'enum',
        enum: RequestStatus,
        default: RequestStatus.PENDING,
    })
    status: RequestStatus;

    @ManyToOne(() => Skill)
    offeredSkill: Skill;

    @ManyToOne(() => Skill)
    requestedSkill: Skill;

    @Column({default: false})
    isRead: boolean;
}