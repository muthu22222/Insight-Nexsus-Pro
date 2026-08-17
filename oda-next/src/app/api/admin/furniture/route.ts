import { NextRequest, NextResponse } from "next/server";
import FurnitureItem from "@/models/FurnitureItem";
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
    const category = searchParams.get("category");
    const style = searchParams.get("style");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const inStock = searchParams.get("inStock");

    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        { productName: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { storeName: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (style) {
      filter.style = style;
    }

    if (minPrice || maxPrice) {
      const priceFilter: Record<string, number> = {};
      if (minPrice) priceFilter.$gte = parseFloat(minPrice);
      if (maxPrice) priceFilter.$lte = parseFloat(maxPrice);
      filter.price = priceFilter;
    }

    if (inStock !== null && inStock !== undefined && inStock !== "") {
      filter.inStock = inStock === "true";
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      FurnitureItem.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      FurnitureItem.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Admin furniture list error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("Forbidden")
      ? 403
      : message.includes("Unauthorized")
        ? 401
        : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    requireAdmin(request);
    await connectToDatabase();

    const body = await request.json();
    const {
      productName,
      category,
      brand,
      price,
      image,
      storeName,
      productUrl,
      style,
      rating,
      description,
      inStock,
      tags,
    } = body;

    if (!productName || !category || !price || !storeName || !productUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "productName, category, price, storeName, and productUrl are required",
        },
        { status: 400 }
      );
    }

    if (typeof price !== "number" || price < 0) {
      return NextResponse.json(
        { success: false, error: "Price must be a positive number" },
        { status: 400 }
      );
    }

    if (rating !== undefined && (typeof rating !== "number" || rating < 0 || rating > 5)) {
      return NextResponse.json(
        { success: false, error: "Rating must be between 0 and 5" },
        { status: 400 }
      );
    }

    const item = await FurnitureItem.create({
      productName: productName.trim(),
      category: category.trim(),
      brand: brand?.trim() || "",
      price,
      image: image || "",
      storeName: storeName.trim(),
      productUrl: productUrl.trim(),
      style: style?.trim() || "",
      rating: rating || 0,
      description: description || "",
      inStock: inStock !== false,
      tags: tags || [],
    });

    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error) {
    console.error("Admin furniture create error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("Forbidden")
      ? 403
      : message.includes("Unauthorized")
        ? 401
        : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function PUT(request: NextRequest) {
  try {
    requireAdmin(request);
    await connectToDatabase();

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Item id is required" },
        { status: 400 }
      );
    }

    if (updateData.price !== undefined) {
      if (typeof updateData.price !== "number" || updateData.price < 0) {
        return NextResponse.json(
          { success: false, error: "Price must be a positive number" },
          { status: 400 }
        );
      }
    }

    if (updateData.rating !== undefined) {
      if (typeof updateData.rating !== "number" || updateData.rating < 0 || updateData.rating > 5) {
        return NextResponse.json(
          { success: false, error: "Rating must be between 0 and 5" },
          { status: 400 }
        );
      }
    }

    const allowedFields = [
      "productName",
      "category",
      "brand",
      "price",
      "image",
      "storeName",
      "productUrl",
      "style",
      "rating",
      "description",
      "inStock",
      "tags",
    ];

    const sanitizedData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        sanitizedData[field] = updateData[field];
      }
    }

    if (sanitizedData.productName) sanitizedData.productName = String(sanitizedData.productName).trim();
    if (sanitizedData.category) sanitizedData.category = String(sanitizedData.category).trim();
    if (sanitizedData.brand) sanitizedData.brand = String(sanitizedData.brand).trim();
    if (sanitizedData.storeName) sanitizedData.storeName = String(sanitizedData.storeName).trim();
    if (sanitizedData.productUrl) sanitizedData.productUrl = String(sanitizedData.productUrl).trim();
    if (sanitizedData.style) sanitizedData.style = String(sanitizedData.style).trim();

    const item = await FurnitureItem.findByIdAndUpdate(
      id,
      { $set: sanitizedData },
      { new: true, runValidators: true }
    );

    if (!item) {
      return NextResponse.json(
        { success: false, error: "Furniture item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error("Admin furniture update error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("Forbidden")
      ? 403
      : message.includes("Unauthorized")
        ? 401
        : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    requireAdmin(request);
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Item id is required" },
        { status: 400 }
      );
    }

    const item = await FurnitureItem.findByIdAndDelete(id);

    if (!item) {
      return NextResponse.json(
        { success: false, error: "Furniture item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: "Furniture item deleted successfully" },
    });
  } catch (error) {
    console.error("Admin furniture delete error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("Forbidden")
      ? 403
      : message.includes("Unauthorized")
        ? 401
        : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
