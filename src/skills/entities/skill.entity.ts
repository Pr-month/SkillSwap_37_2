import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "../../users/entities/user.entity";

@Entity('skills')
export class Skill {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    title: string;

    @Column()
    description: string;

    // category;
    // images;

    @ManyToOne(() => User, (user) => user.skills)
    owner: User;
}
