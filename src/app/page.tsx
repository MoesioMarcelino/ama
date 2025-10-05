"use client";

import {
  Button,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const [roomName, setRoomName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  // Generate room ID from room name
  const generateRoomId = (): string => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 10; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  };

  const handleCreateRoom = async () => {
    if (!roomName.trim() || isCreating) return;

    try {
      setIsCreating(true);

      let roomId = "";
      let attempts = 0;
      const maxAttempts = 5;

      // Try to generate a unique room ID
      while (attempts < maxAttempts) {
        roomId = generateRoomId();

        // Check if room ID already exists
        const checkResponse = await fetch(`/api/rooms/${roomId}`);

        if (checkResponse.status === 404) {
          // Room doesn't exist, we can use this ID
          break;
        }

        attempts++;
      }

      if (attempts >= maxAttempts) {
        toast("Erro ao gerar código único da sala. Tente novamente.");
        return;
      }

      // Create room via API
      const response = await fetch(`/api/rooms/${roomId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: roomName.trim() }),
      });

      if (response.ok) {
        // Room created successfully, navigate to it
        router.push(`/${roomId}`);
      } else {
        const error = await response.json();
        toast(error.error || "Erro ao criar sala");
      }
    } catch (error) {
      console.error("Error creating room:", error);
      toast("Erro ao criar sala. Tente novamente.");
    } finally {
      setIsCreating(false);
    }
  };
  return (
    <main className="flex flex-col items-center justify-center gap-y-6 p-7 sm:p-10 h-screen">
      <Image
        src="/logo.svg"
        alt="Ask Me Anything Logo"
        width={52}
        height={52}
      />

      <h1 className="text-center">
        Crie uma sala pública de AMA (Ask me anything) e priorize as perguntas
        mais importantes para a comunidade.
      </h1>

      {/* Mobile view */}
      <div className="sm:hidden flex flex-col gap-y-2 w-full">
        <Input
          placeholder="Nome da sala"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreateRoom()}
        />
        <Button
          className="flex items-center gap-x-2 cursor-pointer"
          onClick={handleCreateRoom}
          disabled={isCreating || !roomName.trim()}
        >
          <span className="text-accent">
            {isCreating ? "Criando sala..." : "Criar sala"}
          </span>
          <ArrowRight className="text-accent" />
        </Button>
      </div>

      {/* Desktop view */}
      <InputGroup className="hidden  h-12 sm:flex">
        <InputGroupInput
          placeholder="Nome da sala"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreateRoom()}
        />
        <InputGroupAddon align="inline-end">
          <Button
            className="flex items-center gap-x-2 cursor-pointer"
            onClick={handleCreateRoom}
            disabled={isCreating || !roomName.trim()}
          >
            <span className="text-accent">
              {isCreating ? "Criando..." : "Entrar na sala"}
            </span>
            <ArrowRight className="text-accent" />
          </Button>
        </InputGroupAddon>
      </InputGroup>
    </main>
  );
}
