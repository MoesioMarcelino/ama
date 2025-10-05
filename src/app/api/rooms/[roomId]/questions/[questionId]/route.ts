import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string; questionId: string }> }
) {
  try {
    const { questionId } = await params;
    const body = await request.json();
    const { answered } = body;

    if (typeof answered !== "boolean") {
      return NextResponse.json(
        { error: "answered field must be a boolean" },
        { status: 400 }
      );
    }

    // Update question answered status
    const question = await db.question.update({
      where: {
        id: questionId,
      },
      data: {
        answered,
      },
      include: {
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    // Transform data to match frontend expectations
    const transformedQuestion = {
      id: question.id,
      content: question.content,
      likes: question._count.likes,
      liked: false, // TODO: Implement user-specific like status
      answered: question.answered,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
    };

    return NextResponse.json({ question: transformedQuestion });
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json(
      { error: "Failed to update question" },
      { status: 500 }
    );
  }
}
