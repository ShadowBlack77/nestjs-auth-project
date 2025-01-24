import { Role } from "src/auth/enum";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {

  @PrimaryGeneratedColumn()
  readonly id: number;

  @Column({ unique: true })
  readonly username: string;

  @Column({ unique: true })
  readonly email: string;

  @Column({ nullable: true })
  readonly avatarUrl: string;

  @CreateDateColumn()
  readonly createdAt: Date;

  @Column()
  readonly password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER
  })
  readonly role: Role;

  @Column({ nullable: true })
  readonly hashedRefreshToken: string;

  @Column({ nullable: true })
  readonly hashedAccessToken: string;

  @Column({ default: false })
  readonly emailVerified: boolean;
}