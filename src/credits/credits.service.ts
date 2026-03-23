import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { DeductCreditsDto } from './dto/deduct-credits.dto';
import { PurchaseCreditsDto } from './dto/purchase-credits.dto';

@Injectable()
export class CreditsService {
  private readonly logger = new Logger(CreditsService.name);

  constructor(private prisma: PrismaService) {}

  async getBalance(user: User) {
    this.logger.log(`Getting credit balance for user ${user.id}`);

    return {
      success: true,
      data: {
        balance: user.credits,
      },
    };
  }

  async deductCredits(user: User, dto: DeductCreditsDto) {
    this.logger.log(`Deducting ${dto.amount} credits from user ${user.id}`);

    if (user.credits < dto.amount) {
      throw new BadRequestException('Insufficient credits');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // Update user credits
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { credits: { decrement: dto.amount } },
      });

      // Create transaction record
      const transaction = await tx.creditTransaction.create({
        data: {
          userId: user.id,
          amount: -dto.amount,
          type: 'DEDUCT',
          description: `Credits deducted: ${dto.amount}`,
        },
      });

      return {
        balance: updatedUser.credits,
        transaction,
      };
    });

    this.logger.log(`Successfully deducted ${dto.amount} credits from user ${user.id}`);

    return {
      success: true,
      data: {
        balance: result.balance,
        transaction: result.transaction,
      },
    };
  }

  async getTransactionHistory(user: User, page: number = 1, limit: number = 10) {
    this.logger.log(`Getting transaction history for user ${user.id}, page: ${page}, limit: ${limit}`);

    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      this.prisma.creditTransaction.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.creditTransaction.count({
        where: { userId: user.id },
      }),
    ]);

    return {
      success: true,
      data: {
        transactions: transactions.map(tx => ({
          ...tx,
          createdAt: tx.createdAt.toISOString(),
        })),
        total,
        page,
        limit,
      },
    };
  }

  async purchaseCredits(user: User, dto: PurchaseCreditsDto) {
    this.logger.log(`Creating purchase session for user ${user.id}, amount: ${dto.amount}`);

    // For now, we'll simulate a Stripe checkout session
    // In a real implementation, you would integrate with Stripe
    const sessionId = `cs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const checkoutUrl = `https://checkout.stripe.com/pay/${sessionId}`;

    // In a real implementation, you would create a Stripe checkout session here
    // and handle the webhook to add credits after successful payment

    this.logger.log(`Created checkout session ${sessionId} for user ${user.id}`);

    return {
      success: true,
      data: {
        sessionId,
        url: checkoutUrl,
      },
    };
  }

  async addCreditsAfterPurchase(userId: string, amount: number, description: string) {
    this.logger.log(`Adding ${amount} credits to user ${userId} after purchase`);

    const result = await this.prisma.$transaction(async (tx) => {
      // Update user credits
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { credits: { increment: amount } },
      });

      // Create transaction record
      const transaction = await tx.creditTransaction.create({
        data: {
          userId,
          amount,
          type: 'PURCHASE',
          description,
        },
      });

      return {
        balance: updatedUser.credits,
        transaction,
      };
    });

    this.logger.log(`Successfully added ${amount} credits to user ${userId}`);

    return result;
  }

  async addSignupBonus(userId: string) {
    this.logger.log(`Adding signup bonus to user ${userId}`);

    const bonusAmount = 10; // Free tier gets 10 credits on signup

    const result = await this.prisma.$transaction(async (tx) => {
      // Update user credits
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { credits: { increment: bonusAmount } },
      });

      // Create transaction record
      const transaction = await tx.creditTransaction.create({
        data: {
          userId,
          amount: bonusAmount,
          type: 'SIGNUP_BONUS',
          description: 'Welcome bonus - 10 free credits',
        },
      });

      return {
        balance: updatedUser.credits,
        transaction,
      };
    });

    this.logger.log(`Successfully added signup bonus to user ${userId}`);

    return result;
  }
}
