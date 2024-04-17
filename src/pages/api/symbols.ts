// pages/api/symbols.ts

import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const response = await fetch("http://127.0.0.1:8000/api/symbols");
    if (response.ok) {
      const data = await response.json();
      res.status(200).json(data);
    } else {
      throw new Error("Failed to fetch symbols");
    }
  } catch (error) {
    console.error("Error fetching symbols:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
