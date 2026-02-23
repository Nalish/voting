import { Request, Response } from "express";
import { VoteService } from "../services/vote.service";
import { sendSuccess, sendError } from "../utils/response";
import { logger } from "../utils/logger";
import { AppError } from "../utils/errors";

export const VoteController = {

  // POST /api/vote/cast
  // Called when voter submits their ballot
  async cast(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId, biometricId, voteChoice } = req.body;

      // Validate input
      if (!sessionId || !biometricId || !voteChoice) {
        sendError(res, "Missing required vote fields", 400);
        return;
      }

      const vote = await VoteService.castVote(sessionId, biometricId, voteChoice);

      logger.info("Vote cast", { voteId: vote.id });

      sendSuccess(
        res,
        { voteId: vote.id, votedAt: vote.voted_at },
        "Vote cast successfully",
        201
      );
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode);
        return;
      }
      logger.error("Failed to cast vote", { error });
      sendError(res, "Failed to cast vote", 500);
    }
  },

  // GET /api/vote/results
  // Admin only — get vote results
  async getResults(req: Request, res: Response): Promise<void> {
    try {
      const results = await VoteService.getResults();
      const total = await VoteService.getTotalVotes();

      sendSuccess(res, { results, total }, "Results retrieved");
    } catch (error) {
      logger.error("Failed to get results", { error });
      sendError(res, "Failed to get results", 500);
    }
  },

  // GET /api/vote/count
  // Admin only — get total votes cast
  async getCount(req: Request, res: Response): Promise<void> {
    try {
      const total = await VoteService.getTotalVotes();
      sendSuccess(res, { total }, "Vote count retrieved");
    } catch (error) {
      logger.error("Failed to get vote count", { error });
      sendError(res, "Failed to get vote count", 500);
    }
  },
};
