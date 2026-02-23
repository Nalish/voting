import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
} from "typeorm";
import { Biometric } from "./Biometric.entity";

export enum SessionStatus {
  PENDING = "pending",
  SCANNED = "scanned",
  COMPLETED = "completed",
  EXPIRED = "expired",
}

export enum FlowType {
  QR = "qr",           // laptop has no fingerprint → use phone
  DIRECT = "direct",   // laptop has fingerprint → scan directly
}

@Entity("sessions")
export class Session {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  qr_token!: string;

  @Column({
    type: "enum",
    enum: SessionStatus,
    default: SessionStatus.PENDING,
  })
  status!: SessionStatus;

  @Column({
    type: "enum",
    enum: FlowType,
    default: FlowType.QR,
  })
  flow_type!: FlowType;       // ← new field

  @Column()
  expires_at!: Date;

  @CreateDateColumn()
  created_at!: Date;

  @OneToOne(() => Biometric, (biometric) => biometric.session)
  biometric!: Biometric;
}