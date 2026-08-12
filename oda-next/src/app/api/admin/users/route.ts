import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User";
import Project from "@/models/Project";
import { connectToDatabase } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    requireAdmin(request);
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search");
    const role = searchParams.get("role");

    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (role) {
      filter.role = role;
    }

    const skip = (page - 1) * limit;
    const [rawUsers, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      User.countDocuments(filter),
    ]);

    const userIds = rawUsers.map((u) => u._id);

    const projectCounts = await Project.aggregate([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: "$userId", count: { $sum: 1 } } },
    ]);

    const countMap = new Map<string, number>();
    for (const pc of projectCounts) {
      countMap.set(pc._id.toString(), pc.count);
    }

    const users = rawUsers.map((u) => ({
      ...u,
      projectCount: countMap.get(u._id.toString()) || 0,
    }));

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Admin users list error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("Forbidden")
      ? 403
      : message.includes("Unauthorized")
        ? 401
        : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
