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

export default function Home() {
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
        <Input placeholder="Nome da sala" />
        <Button className="flex items-center gap-x-2 cursor-pointer">
          <span className="text-accent">Criar sala</span>
          <ArrowRight className="text-accent" />
        </Button>
      </div>

      {/* Desktop view */}
      <InputGroup className="hidden  h-12 sm:flex">
        <InputGroupInput placeholder="Nome da sala" />
        <InputGroupAddon align="inline-end">
          <Button className="flex items-center gap-x-2 cursor-pointer">
            <span className="text-accent">Entrar na sala</span>
            <ArrowRight className="text-accent" />
          </Button>
        </InputGroupAddon>
      </InputGroup>
    </main>
  );
}
