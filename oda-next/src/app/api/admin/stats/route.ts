import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User";
import Project from "@/models/Project";
import FurnitureItem from "@/models/FurnitureItem";
import { connectToDatabase } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    requireAdmin(request);
    await connectToDatabase();

    const [totalUsers, totalProjects, totalFurnitureItems] = await Promise.all([
      User.countDocuments(),
      Project.countDocuments(),
      FurnitureItem.countDocuments(),
    ]);

    const totalAiRequests = await Project.aggregate([
      { $unwind: "$designs" },
      { $count: "total" },
    ]);

    const aiRequestCount = totalAiRequests.length > 0 ? totalAiRequests[0].total : 0;

    const recentActivity: Array<{
      id: string;
      type: "user_joined" | "project_created" | "furniture_added" | "ai_request";
      message: string;
      timestamp: string;
    }> = [];

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select("name createdAt")
      .lean();

    for (const u of recentUsers) {
      recentActivity.push({
        id: `user-${u._id}`,
        type: "user_joined",
        message: `${u.name} joined the platform`,
        timestamp: u.createdAt.toISOString(),
      });
    }

    const recentProjects = await Project.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select("name createdAt")
      .lean();

    for (const p of recentProjects) {
      recentActivity.push({
        id: `project-${p._id}`,
        type: "project_created",
        message: `New project "${p.name}" was created`,
        timestamp: p.createdAt.toISOString(),
      });
    }

    const recentFurniture = await FurnitureItem.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select("productName createdAt")
      .lean();

    for (const f of recentFurniture) {
      recentActivity.push({
        id: `furniture-${f._id}`,
        type: "furniture_added",
        message: `Furniture "${f.productName}" was added to catalog`,
        timestamp: f.createdAt.toISOString(),
      });
    }

    recentActivity.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalProjects,
        totalFurnitureItems,
        totalAiRequests: aiRequestCount,
        recentActivity: recentActivity.slice(0, 10),
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("Forbidden")
      ? 403
      : message.includes("Unauthorized")
        ? 401
        : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
