import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/app/lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const user = req.query.user || req.body.user;

    // Validate user input
    if (!user || !user.email) {
      return res.status(400).json({
        error: "Invalid request: user email is required",
      });
    }

    // Get database connection using the original approach that was working
    const client = await clientPromise;
    const db = client.db();

    // Find user by email
    const result = await db
      .collection("users")
      .findOne({ email: user.email }, { projection: { progress: 1 } });

    // Return user progress or empty object
    return res.status(200).json({
      progress: result?.progress || {},
    });
  } catch (error) {
    console.error("Error in get-progress API:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
}
