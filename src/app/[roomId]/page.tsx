import {
  Button,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  Skeleton,
} from "@/components";
import { cn } from "@/lib/utils";
import { ArrowRight, ArrowUp, Share2 } from "lucide-react";
import Image from "next/image";

const questions = [
  {
    id: 1,
    content:
      "O que é GoLang e quais são suas principais vantagens em comparação com outras linguagens de programação como Python, Java ou C++?",
    likes: 1,
    liked: false,
    answered: false,
  },
  {
    id: 2,
    content:
      "Como funcionam as goroutines em GoLang e por que elas são importantes para a concorrência e paralelismo?",
    likes: 190,
    liked: true,
    answered: false,
  },
  {
    id: 3,
    content:
      "Quais são as melhores práticas para organizar o código em um projeto GoLang, incluindo pacotes, módulos e a estrutura de diretórios?",
    likes: 190,
    liked: true,
    answered: true,
  },
  {
    id: 4,
    content:
      "Quais são as melhores práticas para organizar o código em um projeto GoLang, incluindo pacotes, módulos e a estrutura de diretórios?",
    likes: 0,
    liked: false,
    answered: false,
  },
];

export default async function Rooms({
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { roomId: string };
}>) {
  const { roomId } = await params;

  const isLoading = false;

  const content = (
    <section className="flex flex-col gap-y-6 w-full mt-10">
      {/* Mobile view */}
      <div className="sm:hidden flex flex-col gap-y-2 w-full">
        <Input placeholder="Qual a sua pergunta?" />
        <Button className="flex items-center gap-x-2 cursor-pointer">
          <span className="text-accent">Criar pergunta</span>
          <ArrowRight className="text-accent" />
        </Button>
      </div>

      {/* Desktop view */}
      <InputGroup className="hidden  h-12 sm:flex">
        <InputGroupInput placeholder="Qual a sua pergunta?" />
        <InputGroupAddon align="inline-end">
          <Button className="flex items-center gap-x-2 cursor-pointer">
            <span className="text-accent">Criar pergunta</span>
            <ArrowRight className="text-accent" />
          </Button>
        </InputGroupAddon>
      </InputGroup>

      {/* Questions list */}
      <ul className="flex flex-col gap-y-10 list-none">
        {questions.map((question, index) => (
          <li
            key={question.id}
            className={cn("flex flex-col gap-y-3 items-start", {
              "text-neutral-600": question.answered,
            })}
          >
            {index + 1}. {question.content}
            <span
              className={cn("text-muted-foreground", {
                "text-neutral-600": question.answered,
                "text-primary": question.liked && !question.answered,
                "hover:text-primary transition-colors cursor-pointer":
                  !question.liked && !question.answered,
              })}
            >
              <ArrowUp className="inline-block mr-1" size={16} />
              Curtir pergunta{" "}
              {question.likes > 0 && <span>({question.likes})</span>}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );

  const loading = (
    <div className="flex flex-col gap-y-12 w-full mt-10">
      {Array.from({ length: 3 }, (_, index) => (
        <div className="flex flex-col w-full space-y-5" key={index}>
          <div className="space-y-2">
            <Skeleton className="h-4" />
            <Skeleton className="h-4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-4 rounded-xl w-1/4" />
        </div>
      ))}
    </div>
  );

  return (
    <main className="flex flex-col items-center justify-center gap-y-6 p-7 sm:p-10 w-full">
      <div className="sm:w-full flex gap-y-2 sm:items-center sm:justify-between">
        <div className="flex items-center gap-x-2 w-full text-center">
          <Image
            src="/logo.svg"
            alt="Ask Me Anything Logo"
            width={32}
            height={32}
          />
          <p className="flex gap-x-1">
            <span className="text-muted-foreground">Código da sala:</span>
            <span>{roomId}</span>
          </p>
        </div>

        <Button className="fixed bottom-8 right-8 sm:static items-center gap-x-2 cursor-pointer bg-primary sm:bg-zinc-700">
          <span className="hidden sm:block">Compartilhar</span>
          <Share2 />
        </Button>
      </div>

      {isLoading ? loading : content}
    </main>
  );
}
