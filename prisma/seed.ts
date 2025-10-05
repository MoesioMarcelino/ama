import { db } from "../src/lib/db";

async function main() {
  console.log("🌱 Seeding database...");

  // Create a test room
  const room = await db.room.upsert({
    where: { id: "golang-ama" },
    update: {},
    create: {
      id: "golang-ama",
      name: "GoLang AMA Session",
    },
  });

  console.log("✅ Room created:", room.id);

  // Create some example questions
  const questions = [
    {
      content:
        "O que é GoLang e quais são suas principais vantagens em comparação com outras linguagens de programação como Python, Java ou C++?",
      roomId: room.id,
    },
    {
      content:
        "Como funcionam as goroutines em GoLang e por que elas são importantes para a concorrência e paralelismo?",
      roomId: room.id,
    },
    {
      content:
        "Quais são as melhores práticas para organizar o código em um projeto GoLang, incluindo pacotes, módulos e a estrutura de diretórios?",
      roomId: room.id,
      answered: true,
    },
    {
      content:
        "Como é o gerenciamento de memória em Go e quais são as principais diferenças em relação a linguagens com garbage collection automático?",
      roomId: room.id,
    },
  ];

  for (const questionData of questions) {
    const question = await db.question.create({
      data: questionData,
    });
    console.log("✅ Question created:", question.id);

    // Add some likes to questions
    if (questionData.content.includes("goroutines")) {
      // Add multiple likes to the goroutines question
      for (let i = 1; i <= 5; i++) {
        await db.like.create({
          data: {
            questionId: question.id,
            userId: `user-${i}`,
          },
        });
      }
      console.log("✅ Added 5 likes to goroutines question");
    } else if (questionData.answered) {
      // Add 3 likes to the answered question
      for (let i = 1; i <= 3; i++) {
        await db.like.create({
          data: {
            questionId: question.id,
            userId: `user-${i}`,
          },
        });
      }
      console.log("✅ Added 3 likes to answered question");
    }
  }

  console.log("🎉 Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
