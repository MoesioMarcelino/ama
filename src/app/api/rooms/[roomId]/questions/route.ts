import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;

    // Ensure room exists or create it
    let room = await db.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      room = await db.room.create({
        data: { id: roomId },
      });
    }

    // Get questions with like counts
    const questions = await db.question.findMany({
      where: {
        roomId: roomId,
      },
      include: {
        _count: {
          select: {
            likes: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform data to match frontend expectations
    const transformedQuestions = questions.map((question) => ({
      id: question.id,
      content: question.content,
      likes: question._count.likes,
      liked: false, // TODO: Implement user-specific like status
      answered: question.answered,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
    }));

    return NextResponse.json({ questions: transformedQuestions });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const body = await request.json();
    const { content } = body;

    if (
      !content ||
      typeof content !== "string" ||
      content.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Ensure room exists or create it
    let room = await db.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      room = await db.room.create({
        data: { id: roomId },
      });
    }

    // Create question
    const question = await db.question.create({
      data: {
        content: content.trim(),
        roomId: roomId,
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
      liked: false,
      answered: question.answered,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
    };

    return NextResponse.json(
      { question: transformedQuestion },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 }
    );
  }
}
