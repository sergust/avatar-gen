import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { buffer } from "micro";
import { db } from "~/server/db";

const stripe = new Stripe(process.env.NEXT_SECRET_STRIPE_KEY!);

/**
 * Needs to be here for Next.js
 */
export const config = {
  api: {
    bodyParser: false,
  },
};

const webhook = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const buf = await buffer(req);
    const sig = req.headers["stripe-signature"] as string;

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        buf,
        sig,
        process.env.STRIPE_WEB_HOOK_SECRET!,
      );
    } catch (err) {
      let message = "Unknown error";
      if (err instanceof Error) message = err.message;

      res.status(400).send(`Webhook Error: ${message}`);
      return;
    }

    switch (event.type) {
      case "checkout.session.completed":
        const checkoutSessionCompleted = event.data.object;

        await db.user.update({
          where: {
            id: checkoutSessionCompleted.metadata!.userId,
          },
          data: {
            credits: {
              increment: 100,
            },
          },
        });
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.json({ received: true });
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method not allowed");
  }
};

export default webhook;
