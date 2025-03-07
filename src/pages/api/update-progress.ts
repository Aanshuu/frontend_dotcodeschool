import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/app/lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { updates } = req.body;

    // Validate input
    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        error: "Invalid request: updates array is required",
      });
    }

    // Get database connection using the original approach that was working
    const client = await clientPromise;
    const db = client.db();

    // Prepare bulk operations
    const operations = updates.map((update) => {
      const { user, progress } = update;

      // Validate user
      if (!user || !user.email) {
        throw new Error("Invalid update: user email is required");
      }

      // Prepare update object
      const updateObject: Record<string, boolean> = {};

      // Flatten progress object into dot notation for MongoDB
      for (const courseId in progress) {
        for (const lessonId in progress[courseId]) {
          for (const chapterId in progress[courseId][lessonId]) {
            const path = `progress.${courseId}.${lessonId}.${chapterId}`;
            updateObject[path] = progress[courseId][lessonId][chapterId];
          }
        }
      }

      // Return updateOne operation for bulk write
      return {
        updateOne: {
          filter: { email: user.email },
          update: { $set: updateObject },
          upsert: true, // Create user if doesn't exist
        },
      };
    });

    // Execute bulk write operation
    const result = await db.collection("users").bulkWrite(operations);

    return res.status(200).json({
      success: true,
      modified: result.modifiedCount,
      inserted: result.upsertedCount,
    });
  } catch (error) {
    console.error("Error in update-progress API:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
