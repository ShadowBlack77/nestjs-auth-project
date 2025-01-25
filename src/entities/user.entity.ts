import { AuthProvider, Role } from "src/auth/enum";
import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { EmailTokens } from "./email_tokens.entity";

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

  @Column({
    type: 'enum',
    enum: AuthProvider,
    default: AuthProvider.LOCAL_PROVIDER
  })
  readonly authProvider: AuthProvider;

  @Column({ nullable: true })
  readonly hashedRefreshToken: string;

  @Column({ nullable: true })
  readonly hashedAccessToken: string;

  @Column({ default: false })
  readonly emailVerified: boolean;

  @Column({ name: '2fa', default: false })
  readonly tfa: boolean;

  @OneToMany(() => EmailTokens, (emailTokens) => emailTokens.user)
  readonly emailTokens: EmailTokens[];
}