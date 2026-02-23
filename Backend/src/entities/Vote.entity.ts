import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { Biometric } from "./Biometric.entity";

@Entity("votes")
export class Vote {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  biometric_id!: string;

  @OneToOne(() => Biometric, (biometric) => biometric.vote)
  @JoinColumn({ name: "biometric_id" })
  biometric!: Biometric;

  @Column()
  vote_choice!: string;

  @CreateDateColumn()
  voted_at!: Date;
}


