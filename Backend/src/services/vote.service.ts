import { AppDataSource } from "../config/database";
import { Vote } from "../entities/Vote.entity";
import { Biometric } from "../entities/Biometric.entity";
import { SessionService } from "./session.service";
import { BiometricService } from "./biometric.service";
import {
  NotFoundError,
  ConflictError,
  InternalError,
} from "../utils/errors";
import { logger } from "../utils/logger";
import { emitVoteCast } from "../websocket/socket";

const voteRepository = AppDataSource.getRepository(Vote);

export const VoteService = {

  // Cast a vote — the most critical function in the system
  async castVote(
    sessionId: string,
    biometricId: string,
    voteChoice: string
  ): Promise<Vote> {

    // Step 1: Make sure biometric record exists
    const biometric = await BiometricService.findById(biometricId);
    if (!biometric) {
      throw new NotFoundError("Biometric record not found");
    }

    // Step 2: Check if this biometric has already voted
    const existingVote = await voteRepository.findOne({
      where: { biometric_id: biometricId },
    });
    if (existingVote) {
      logger.warn("Duplicate vote attempt", { biometricId });
      throw new ConflictError("You have already voted");
    }

    // Step 3: Cast the vote in an atomic transaction
    // Both the vote save and session completion happen together
    // If either fails, neither is saved
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Save the vote
      const vote = voteRepository.create({
        biometric_id: biometricId,
        vote_choice: voteChoice,
      });
      await queryRunner.manager.save(vote);

      // Mark session as completed inside same transaction
      await SessionService.markAsCompleted(sessionId);

      // Commit everything
      await queryRunner.commitTransaction();

      emitVoteCast(sessionId);

      logger.info("Vote cast successfully", {
        voteId: vote.id,
        sessionId,
      });

      return vote;
    } catch (error) {
      // Something went wrong — roll back everything
      await queryRunner.rollbackTransaction();
      logger.error("Failed to cast vote — transaction rolled back", { error });
      throw new InternalError("Failed to cast vote. Please try again");
    } finally {
      // Always release the query runner
      await queryRunner.release();
    }
  },

  // Get total vote counts per choice (for admin results page)
  async getResults(): Promise<{ choice: string; count: number }[]> {
    const results = await voteRepository
      .createQueryBuilder("vote")
      .select("vote.vote_choice", "choice")
      .addSelect("COUNT(*)", "count")
      .groupBy("vote.vote_choice")
      .getRawMany();

    return results;
  },

  // Get total number of votes cast
  async getTotalVotes(): Promise<number> {
    return voteRepository.count();
  },
};
