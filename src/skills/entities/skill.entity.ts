import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';

@Entity('skills')
export class Skill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  title: string;

  @Column()
  description: string;

  // category;
  @ManyToOne(() => Category, (category) => category.children)
  category: Category;

  // images;
  @Column({ type: 'text', array: true })
  images: string[];

  @ManyToOne(() => User, (user) => user.skills)
  owner: User;
}
