import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Helper function to get user identifier (IP or session)
function getUserIdentifier(request: NextRequest): string {
  // In a real app, you'd use proper authentication
  // For now, we'll use IP address as identifier
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded
    ? forwarded.split(",")[0]
    : request.headers.get("x-real-ip");
  return ip || "anonymous";
}

export async function POST(
  request: NextRequest,
  { params }: { params: { roomId: string; questionId: string } }
) {
  try {
    const { questionId } = await params;
    const userId = getUserIdentifier(request);

    // Check if question exists
    const question = await db.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // Check if user already liked this question
    const existingLike = await db.like.findUnique({
      where: {
        questionId_userId: {
          questionId,
          userId,
        },
      },
    });

    if (existingLike) {
      return NextResponse.json(
        { error: "Question already liked by this user" },
        { status: 400 }
      );
    }

    // Create like
    await db.like.create({
      data: {
        questionId,
        userId,
      },
    });

    // Get updated question with like count
    const updatedQuestion = await db.question.findUnique({
      where: { id: questionId },
      include: {
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      likes: updatedQuestion?._count.likes || 0,
      liked: true,
    });
  } catch (error) {
    console.error("Error liking question:", error);
    return NextResponse.json(
      { error: "Failed to like question" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { roomId: string; questionId: string } }
) {
  try {
    const { questionId } = await params;
    const userId = getUserIdentifier(request);

    // Check if like exists
    const existingLike = await db.like.findUnique({
      where: {
        questionId_userId: {
          questionId,
          userId,
        },
      },
    });

    if (!existingLike) {
      return NextResponse.json({ error: "Like not found" }, { status: 404 });
    }

    // Delete like
    await db.like.delete({
      where: {
        questionId_userId: {
          questionId,
          userId,
        },
      },
    });

    // Get updated question with like count
    const updatedQuestion = await db.question.findUnique({
      where: { id: questionId },
      include: {
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      likes: updatedQuestion?._count.likes || 0,
      liked: false,
    });
  } catch (error) {
    console.error("Error unliking question:", error);
    return NextResponse.json(
      { error: "Failed to unlike question" },
      { status: 500 }
    );
  }
}
