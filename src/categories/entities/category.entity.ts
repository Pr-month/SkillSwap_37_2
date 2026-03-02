import {Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";

@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne(() => Category, (category) => category.children, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    parent: Category | null;

    @OneToMany(() => Category, (category) => category.parent)
    children: Category[];
}
