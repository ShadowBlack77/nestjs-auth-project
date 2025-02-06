import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class LoginSession {

  @PrimaryGeneratedColumn()
  readonly id: number;

  @Column({ unique: true })
  readonly loginSessionId: string;

  @Column()
  readonly expiresAt: Date;

  @OneToOne(() => User, (user) => user.loginSession)
  @JoinColumn()
  readonly user: User;
}