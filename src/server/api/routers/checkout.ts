import { z } from "zod";
import Stripe from "stripe";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { env } from "process";

const stripe = new Stripe(env.NEXT_SECRET_STRIPE_KEY!);

export const checkoutRouter = createTRPCRouter({
  createCheckout: protectedProcedure.mutation(async ({ ctx }) => {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      metadata: {
        userId: ctx.session.user.id,
      },
      success_url: `${env.HOST_NAME}`,
      cancel_url: `${env.HOST_NAME}`,
      line_items: [{ price: env.PRICE_ID, quantity: 1 }],
      mode: "payment",
    });

    return session;
  }),
});
