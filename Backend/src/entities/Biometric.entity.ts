import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { Session } from "./Session.entity";
import { Vote } from "./Vote.entity";

@Entity("biometrics")
export class Biometric {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  credential_id!: string;

  @Column({ type: "text" })
  public_key!: string;

  @Column({ unique: true, nullable: true })
  fingerprint_hash!: string;

  @Column()
  session_id!: string;

  @OneToOne(() => Session)
  @JoinColumn({ name: "session_id" })
  session!: Session;

  @OneToOne(() => Vote, (vote) => vote.biometric)
  vote!: Vote;

  @CreateDateColumn()
  created_at!: Date;
}