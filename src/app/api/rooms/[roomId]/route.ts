import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const { roomId } = await params;
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Room name is required" },
        { status: 400 }
      );
    }

    // Check if room already exists
    const existingRoom = await db.room.findUnique({
      where: { id: roomId },
    });

    if (existingRoom) {
      return NextResponse.json(
        {
          error: "Uma sala com este nome já existe",
          room: existingRoom,
        },
        { status: 409 }
      );
    }

    // Create new room
    const room = await db.room.create({
      data: {
        id: roomId,
        name: name.trim(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        room,
        message: "Sala criada com sucesso!",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const { roomId } = await params;

    const room = await db.room.findUnique({
      where: { id: roomId },
      include: {
        _count: {
          select: {
            questions: true,
          },
        },
      },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    return NextResponse.json({
      room: {
        ...room,
        questionCount: room._count.questions,
      },
    });
  } catch (error) {
    console.error("Error fetching room:", error);
    return NextResponse.json(
      { error: "Failed to fetch room" },
      { status: 500 }
    );
  }
}
