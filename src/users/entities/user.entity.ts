import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserGender, UserRole } from '../users.enums';
import { Skill } from '../../skills/entities/skill.entity';
import { Exclude } from 'class-transformer';
import { IsArray } from 'class-validator';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  about: string;

  @Column({ type: 'date' })
  birthdate: Date;

  @Column()
  city: string;

  @Column({
    type: 'enum',
    enum: UserGender,
  })
  gender: UserGender;

  @Column()
  avatar: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ nullable: true })
  @Exclude()
  refreshToken: string;

  @Column("simple-array")
  @IsArray()
  favoriteSkills: number[];

  @OneToMany(() => Skill, (skill) => skill.owner)
  skills: Skill[];
}
