"use client";

import { Button, Skeleton, Textarea } from "@/components";
import { cn } from "@/lib/utils";
import type { Question } from "@/types/api";
import { ArrowRight, ArrowUp, Plus, Share2 } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function Rooms() {
  const params = useParams();
  const roomId = params.roomId as string;

  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState("");
  const [roomInfo, setRoomInfo] = useState<{ name?: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTextareaExpanded, setIsTextareaExpanded] = useState(false);

  // Fetch questions
  const fetchQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/rooms/${roomId}/questions`);
      if (response.ok) {
        const data = await response.json();
        // Sort questions by likes (descending), then by creation date (descending)
        const sortedQuestions = data.questions.sort(
          (a: Question, b: Question) => {
            if (b.likes !== a.likes) {
              return b.likes - a.likes;
            }
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          }
        );
        setQuestions(sortedQuestions);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [roomId]);

  // Fetch room info
  const fetchRoomInfo = useCallback(async () => {
    try {
      const response = await fetch(`/api/rooms/${roomId}`);
      if (response.ok) {
        const data = await response.json();
        setRoomInfo(data.room);
      }
    } catch (error) {
      console.error("Error fetching room info:", error);
    }
  }, [roomId]);

  useEffect(() => {
    fetchQuestions();
    fetchRoomInfo();
  }, [fetchQuestions, fetchRoomInfo]);

  // Create new question
  const handleCreateQuestion = async () => {
    if (!newQuestion.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/rooms/${roomId}/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newQuestion.trim() }),
      });

      if (response.ok) {
        setNewQuestion("");
        setIsTextareaExpanded(false); // Collapse textarea after creating question
        await fetchQuestions(); // Refresh questions
      }
    } catch (error) {
      console.error("Error creating question:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle textarea key events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleCreateQuestion();
    }
  };

  // Toggle like with optimistic updates
  const handleToggleLike = async (
    questionId: string,
    currentlyLiked: boolean
  ) => {
    // Optimistic update - update UI immediately
    const optimisticUpdate = (questions: Question[]) => {
      return questions
        .map((q) =>
          q.id === questionId
            ? {
                ...q,
                likes: currentlyLiked ? q.likes - 1 : q.likes + 1,
                liked: !currentlyLiked,
              }
            : q
        )
        .sort((a, b) => {
          // Sort by likes (descending), then by creation date (descending)
          if (b.likes !== a.likes) {
            return b.likes - a.likes;
          }
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
    };

    // Apply optimistic update
    setQuestions(optimisticUpdate);

    try {
      const method = currentlyLiked ? "DELETE" : "POST";
      const response = await fetch(
        `/api/rooms/${roomId}/questions/${questionId}/like`,
        {
          method,
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Update with real data from server and sort again
        setQuestions((prev) =>
          prev
            .map((q) =>
              q.id === questionId
                ? { ...q, likes: data.likes, liked: data.liked }
                : q
            )
            .sort((a, b) => {
              if (b.likes !== a.likes) {
                return b.likes - a.likes;
              }
              return (
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
              );
            })
        );
      } else {
        throw new Error("Failed to update like");
      }
    } catch (error) {
      console.error("Error toggling like:", error);

      // Revert optimistic update on error
      setQuestions((prev) =>
        prev
          .map((q) =>
            q.id === questionId
              ? {
                  ...q,
                  likes: currentlyLiked ? q.likes + 1 : q.likes - 1,
                  liked: currentlyLiked,
                }
              : q
          )
          .sort((a, b) => {
            if (b.likes !== a.likes) {
              return b.likes - a.likes;
            }
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          })
      );

      toast("Erro ao curtir pergunta. Tente novamente.");
    }
  };

  // Share room
  const handleShareRoom = async () => {
    const roomUrl = `${window.location.origin}/${roomId}`;

    try {
      await navigator.clipboard.writeText(roomUrl);
      toast("Link da sala copiado para a área de transferência!");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast(`Link da sala: ${roomUrl}`);
    }
  };

  const content = (
    <section className="flex flex-col gap-y-6 w-full mt-10">
      {/* Mobile view */}
      <div className="sm:hidden flex flex-col gap-y-2 w-full">
        <div className="relative">
          <Textarea
            placeholder="Qual a sua pergunta?"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsTextareaExpanded(true)}
            onBlur={() => !newQuestion.trim() && setIsTextareaExpanded(false)}
            className={cn(
              "pr-12 pb-12 resize-none transition-all duration-300 ease-in-out",
              isTextareaExpanded ? "min-h-[120px]" : "min-h-[48px]"
            )}
            rows={isTextareaExpanded ? 4 : 1}
          />
          <Button
            className={cn(
              "absolute right-2 h-8 w-8 p-0 cursor-pointer transition-all duration-300 ease-in-out",
              isTextareaExpanded
                ? "bottom-2 opacity-100"
                : "bottom-2 opacity-60"
            )}
            onClick={handleCreateQuestion}
            disabled={isSubmitting || !newQuestion.trim()}
          >
            <ArrowRight className="text-accent h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Desktop view */}
      <div className="hidden sm:block w-full">
        <div className="relative">
          <Textarea
            placeholder="Qual a sua pergunta?"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsTextareaExpanded(true)}
            onBlur={() => !newQuestion.trim() && setIsTextareaExpanded(false)}
            className={cn(
              "pr-12 pb-12 resize-none transition-all duration-300 ease-in-out",
              isTextareaExpanded ? "min-h-[120px]" : "min-h-[48px]"
            )}
            rows={isTextareaExpanded ? 4 : 1}
          />
          <Button
            className={cn(
              "absolute right-2 h-8 w-8 p-0 cursor-pointer transition-all duration-300 ease-in-out",
              isTextareaExpanded
                ? "bottom-2 opacity-100"
                : "bottom-2 opacity-60"
            )}
            onClick={handleCreateQuestion}
            disabled={isSubmitting || !newQuestion.trim()}
          >
            <ArrowRight className="text-accent h-4 w-4" />
          </Button>
        </div>
      </div>

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
            <button
              onClick={() => handleToggleLike(question.id, question.liked)}
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
            </button>
          </li>
        ))}
      </ul>

      {questions.length === 0 && !isLoading && (
        <div className="text-center text-muted-foreground py-8 flex flex-col items-center gap-y-8">
          <p>Nenhuma pergunta ainda. Seja o primeiro a perguntar!</p>
        </div>
      )}
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
    <main className="flex flex-col justify-center gap-y-6 p-7 sm:p-10 w-full">
      <div className="sm:w-full flex gap-y-2 sm:items-center sm:justify-between">
        <div className="flex flex-col w-full">
          <Image
            src="/logo.svg"
            alt="Ask Me Anything Logo"
            width={40}
            height={40}
            className="mb-2"
          />
          {roomInfo?.name && (
            <p className="text-sm font-medium">{roomInfo.name}</p>
          )}
          <p className="flex gap-x-1 text-sm">
            <span className="text-muted-foreground">Código da sala:</span>
            <span>{roomId}</span>
          </p>
        </div>

        <div className="fixed bottom-8 right-8 sm:static items-center gap-x-2 ">
          <div className="flex flex-col gap-y-4 sm:gap-y-2">
            <Button onClick={() => router.push("/")}>
              <span className="hidden sm:block">Nova sala</span>
              <Plus />
            </Button>
            <Button
              onClick={handleShareRoom}
              className="cursor-pointer bg-zinc-700"
            >
              <span className="hidden sm:block">Compartilhar</span>
              <Share2 />
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? loading : content}
    </main>
  );
}
