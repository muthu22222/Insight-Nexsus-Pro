import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { authenticate } from '@/lib/auth';

interface BudgetItem {
  category: string;
  price: number;
  quantity: number;
}

interface BudgetAllocation {
  category: string;
  amount: number;
  percentage: number;
}

const CATEGORY_DEFAULT_PERCENTAGES: Record<string, number> = {
  'Living Room': 30,
  Bedroom: 20,
  Kitchen: 20,
  Lighting: 10,
  Decor: 10,
  Misc: 10,
};

export async function POST(request: NextRequest) {
  try {
    authenticate(request);
    await connectToDatabase();

    const body = await request.json();
    const { totalBudget, items } = body as {
      totalBudget: number;
      items: BudgetItem[];
    };

    if (!totalBudget || totalBudget <= 0) {
      return NextResponse.json(
        { success: false, error: 'totalBudget must be a positive number' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'items array is required and must not be empty' },
        { status: 400 }
      );
    }

    const categoryTotals: Record<string, number> = {};
    let totalItemCost = 0;

    for (const item of items) {
      const cat = item.category || 'Misc';
      const cost = item.price * (item.quantity || 1);
      categoryTotals[cat] = (categoryTotals[cat] || 0) + cost;
      totalItemCost += cost;
    }

    const allocations: BudgetAllocation[] = [];
    const allCategories = Object.keys(CATEGORY_DEFAULT_PERCENTAGES);

    for (const category of allCategories) {
      const spent = categoryTotals[category] || 0;
      const defaultPercentage = CATEGORY_DEFAULT_PERCENTAGES[category];
      const allocated = Math.round(totalBudget * (defaultPercentage / 100));

      allocations.push({
        category,
        amount: allocated,
        percentage: defaultPercentage,
      });
    }

    let totalAllocated = allocations.reduce((sum, a) => sum + a.amount, 0);
    let remaining = totalBudget - totalAllocated;

    if (remaining < 0) {
      const scale = totalBudget / totalAllocated;
      for (const allocation of allocations) {
        allocation.amount = Math.round(allocation.amount * scale);
      }
      totalAllocated = allocations.reduce((sum, a) => sum + a.amount, 0);
      remaining = totalBudget - totalAllocated;
    }

    return NextResponse.json({
      success: true,
      data: {
        totalBudget,
        allocations,
        totalAllocated,
        spent: totalItemCost,
        remaining,
      },
    });
  } catch (error) {
    console.error('Budget plan error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}
