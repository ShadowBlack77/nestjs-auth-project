import { EmailTokensTypes } from "src/auth/enum";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class EmailTokens {

  @PrimaryGeneratedColumn()
  readonly id: number;

  @Column({ unique: true })
  readonly token: string;

  @Column()
  readonly expiresAt: Date;

  @Column({
    type: 'enum',
    enum: EmailTokensTypes
  })
  readonly type: EmailTokensTypes;

  @ManyToOne(() => User, (user) => user.emailTokens)
  @JoinColumn()
  readonly user: User;
}