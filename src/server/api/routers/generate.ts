import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { type Icon, type Prisma } from "@prisma/client";
import OpenAI from "openai";
import { env } from "process";
import { type ImagesResponse } from "openai/resources/images.mjs";
import { b64Image } from "~/data/b64image";
import AWS from "aws-sdk";

const s3 = new AWS.S3({
  credentials: {
    accessKeyId: env.ACCESS_KEY_ID!,
    secretAccessKey: env.SECRET_ACCESS_KEY_ID!,
  },
  region: "ap-southeast-2",
});

const openai = new OpenAI({
  apiKey: env.DALLE_API_KEY,
});

const BUCKET_NAME = env.BUCKET_NAME;

const generateIcon = async (input: string): Promise<ImagesResponse> => {
  if (env.MOCK_DALLE_API !== "true") {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: input,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json",
    });
    return response;
  } else {
    return {
      created: 1708674987,
      data: [
        {
          revised_prompt:
            "Depict an apocalyptic scenario of Bondi Beach, reminiscent of the universe presented in a popular post-apocalyptic video game franchise. The scene should be hauntingly beautiful, the beach barely recognizable, nature slowly taking over; sand dunes are dotted with dilapidated and overgrown structures once teeming with life. In the scenery, there are remnants of human civilization such as a semi-submerged lifeguard tower and a faded surfboard half-buried in the sand. The sea is calm, under the looming grey cloudy sky which adds to the dramatic nature of the image. In the foreground, a generic wanderer character, with a backpack, is exploring the beach, highlighting the desolation and loneliness of this world turned wild.",
          b64_json: b64Image,
        },
        {
          revised_prompt:
            "Visualize Bondi Beach during a zombie apocalypse. The beach is deserted, the colorful beach huts are damaged, and chaos reigns over the previously idyllic location. Bewildered zombies, a mix of Caucasian and African descent, both male and female, are wandering aimlessly on the golden sand, their grotesque figures silhouetted against the setting sun. The normally vibrant blue ocean is tainted, and the desolate boardwalk displays the remnants of carefree days now lost. End the separation with the cityscape now darkened and plunged into chaos, with smoke pouring from buildings hinting at the devastation beyond the beach's edge.",
          b64_json: b64Image,
        },
      ],
    } as ImagesResponse;
  }
};

export const generateRouter = createTRPCRouter({
  generateIcon: protectedProcedure
    .input(
      z.object({
        prompt: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = (await ctx.db.user.updateMany({
        where: {
          id: ctx.session.user.id,
          credits: {
            gte: 1,
          },
        },
        data: {
          credits: {
            decrement: 1,
          },
        },
      })) as Prisma.BatchPayload;

      const { count } = result;
      if (count <= 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You do not have enough credits",
        });
      }

      const response = await generateIcon(input.prompt);
      const picture = response.data[0]?.b64_json;

      if (!picture) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No images",
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const icon: Icon = (await ctx.db.icon.create({
        data: {
          prompt: input.prompt,
          userId: ctx.session.user.id,
        },
      })) as Icon;

      await s3
        .putObject({
          Bucket: BUCKET_NAME,
          Body: Buffer.from(picture, "base64"),
          Key: icon.id,
          ContentEncoding: "base64",
          ContentType: "image/png",
        })
        .promise();

      // const { data } = response;

      return {
        imageUrl: `https://${BUCKET_NAME}.s3.ap-southeast-2.amazonaws.com/${icon.id}`,
      };
    }),
});
