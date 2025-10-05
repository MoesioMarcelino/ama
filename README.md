# 🎤 AMA - Ask Me Anything

Uma plataforma moderna e interativa para sessões de perguntas e respostas (AMA - Ask Me Anything) construída com Next.js, Prisma e SQLite.

![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.16.3-2D3748?style=flat&logo=prisma)
![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?style=flat&logo=sqlite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat&logo=tailwind-css)

## ✨ Funcionalidades

### 🏠 **Criação de Salas**

- **IDs únicos alfanuméricos** de 10 caracteres
- **Nomes personalizados** para identificação
- **Detecção de salas existentes** com opção de entrada
- **URLs amigáveis** para fácil compartilhamento

### ❓ **Sistema de Perguntas**

- **Interface expansível** com textarea que cresce conforme necessário
- **Criação instantânea** com feedback visual
- **Suporte a quebras de linha** (Shift + Enter)
- **Validação de conteúdo** automática

### 👍 **Sistema de Likes Inteligente**

- **Programação positiva** - updates instantâneos na UI
- **Reordenação automática** por número de likes
- **Rollback em caso de erro** com notificações toast
- **Prevenção de likes duplicados** por usuário

### 📱 **Design Responsivo**

- **Interface adaptável** para desktop e mobile
- **Botões flutuantes** em dispositivos móveis
- **Transições suaves** e animações modernas
- **Temas** dark/light automáticos

### 🔗 **Compartilhamento**

- **Cópia automática** do link da sala
- **Notificações toast** para confirmação
- **Fallback** para compartilhamento manual

## 🛠️ Stack Tecnológica

### **Frontend**

- **Next.js 15.5.4** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS 4.0** - Estilização utilitária
- **Lucide React** - Ícones modernos
- **Sonner** - Notificações toast elegantes

### **Backend**

- **Next.js API Routes** - Endpoints RESTful
- **Prisma 6.16.3** - ORM moderno
- **SQLite** - Banco de dados leve e eficiente

### **UI/UX**

- **Radix UI** - Componentes acessíveis
- **Class Variance Authority** - Variações de estilo
- **Framer Motion** - Animações (via tw-animate-css)

## 🚀 Instalação e Configuração

### **Pré-requisitos**

- Node.js 18+
- npm ou yarn

### **1. Clone o repositório**

```bash
git clone <repository-url>
cd ama
```

### **2. Instale as dependências**

```bash
npm install
```

### **3. Configure o banco de dados**

```bash
# Gerar o banco SQLite
npx prisma db push

# Popular com dados de exemplo
npm run db:seed
```

### **4. Execute o projeto**

```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

### **5. Acesse a aplicação**

```
http://localhost:3001
```

## 📊 Scripts Disponíveis

| Script              | Descrição                                  |
| ------------------- | ------------------------------------------ |
| `npm run dev`       | Inicia servidor de desenvolvimento         |
| `npm run build`     | Build para produção                        |
| `npm start`         | Inicia servidor de produção                |
| `npm run lint`      | Executa linting do código                  |
| `npm run db:seed`   | Popula banco com dados de exemplo          |
| `npm run db:studio` | Abre Prisma Studio (visualização do banco) |

## 🏗️ Estrutura do Projeto

```
├── src/
│   ├── app/                    # App Router (Next.js 13+)
│   │   ├── api/               # API Routes
│   │   │   └── rooms/         # Endpoints das salas
│   │   ├── [roomId]/          # Página dinâmica da sala
│   │   ├── page.tsx           # Página inicial
│   │   └── layout.tsx         # Layout principal
│   ├── components/            # Componentes reutilizáveis
│   │   └── ui/               # Componentes de UI base
│   ├── lib/                  # Utilitários e configurações
│   └── types/                # Definições TypeScript
├── prisma/
│   ├── schema.prisma         # Schema do banco de dados
│   ├── seed.ts              # Script de seed
│   └── migrations/          # Migrações do banco
└── public/                  # Arquivos estáticos
```

## 🗄️ Modelo de Dados

### **Room (Sala)**

```typescript
{
  id: string        // ID alfanumérico único (10 chars)
  name?: string     // Nome opcional da sala
  createdAt: Date   // Data de criação
  updatedAt: Date   // Última atualização
  questions: Question[] // Perguntas da sala
}
```

### **Question (Pergunta)**

```typescript
{
  id: string        // ID único
  content: string   // Conteúdo da pergunta
  roomId: string    // ID da sala
  answered: boolean // Status de resposta
  createdAt: Date   // Data de criação
  updatedAt: Date   // Última atualização
  likes: Like[]     // Likes recebidos
}
```

### **Like (Curtida)**

```typescript
{
  id: string; // ID único
  questionId: string; // ID da pergunta
  userId: string; // ID do usuário (IP-based)
  createdAt: Date; // Data da curtida
}
```

## 🎯 Algoritmos Principais

### **Reordenação de Perguntas**

```typescript
questions.sort((a, b) => {
  // 1. Prioridade: Mais likes primeiro
  if (b.likes !== a.likes) {
    return b.likes - a.likes;
  }
  // 2. Critério secundário: Mais recentes primeiro
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
});
```

### **Programação Positiva (Likes)**

```typescript
// 1. Update otimista na UI
updateUI(optimisticState);

// 2. Chamada para API
try {
  const result = await api.like(questionId);
  confirmUpdate(result);
} catch {
  // 3. Rollback em caso de erro
  revertUpdate();
  showErrorToast();
}
```

## 🌐 API Endpoints

| Método   | Endpoint                                  | Descrição              |
| -------- | ----------------------------------------- | ---------------------- |
| `GET`    | `/api/rooms/[roomId]`                     | Obter dados da sala    |
| `POST`   | `/api/rooms/[roomId]`                     | Criar nova sala        |
| `GET`    | `/api/rooms/[roomId]/questions`           | Listar perguntas       |
| `POST`   | `/api/rooms/[roomId]/questions`           | Criar pergunta         |
| `PATCH`  | `/api/rooms/[roomId]/questions/[id]`      | Marcar como respondida |
| `POST`   | `/api/rooms/[roomId]/questions/[id]/like` | Curtir pergunta        |
| `DELETE` | `/api/rooms/[roomId]/questions/[id]/like` | Descurtir pergunta     |

## 🎨 Componentes UI

### **Principais**

- **Button** - Botão com variações de estilo
- **Input/Textarea** - Campos de entrada expansíveis
- **InputGroup** - Agrupamento de inputs com addons
- **Skeleton** - Placeholders de carregamento
- **Toast** - Notificações não-intrusivas

### **Funcionalidades**

- **Expansão automática** do textarea
- **Estados visuais** (loading, disabled, error)
- **Transições suaves** com CSS
- **Acessibilidade** completa (ARIA)

## 🔧 Configuração Avançada

### **Variáveis de Ambiente**

```env
DATABASE_URL="file:./dev.db"
```

### **Customização do Banco**

Para usar PostgreSQL ou MySQL, altere o `schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // ou "mysql"
  url      = env("DATABASE_URL")
}
```

### **Temas e Estilos**

O projeto usa Tailwind CSS 4.0 com configuração customizada em `tailwind.config.js`.

## 🚀 Deploy

### **Vercel (Recomendado)**

```bash
npm i -g vercel
vercel
```

### **Docker**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contribuição

1. **Fork** o projeto
2. **Crie** uma branch para sua feature (`git checkout -b feature/amazing-feature`)
3. **Commit** suas mudanças (`git commit -m 'Add amazing feature'`)
4. **Push** para a branch (`git push origin feature/amazing-feature`)
5. **Abra** um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🏆 Roadmap

- [ ] **Autenticação** com múltiplos provedores
- [ ] **Respostas** em tempo real via WebSocket
- [ ] **Moderação** avançada de perguntas
- [ ] **Analytics** de engajamento
- [ ] **Temas** personalizáveis
- [ ] **Exportação** de dados
- [ ] **API pública** para integrações

## 📞 Suporte

Para dúvidas, sugestões ou problemas:

- 📧 **Email**: [seu-email@exemplo.com]
- 🐛 **Issues**: [GitHub Issues](link)
- 💬 **Discussões**: [GitHub Discussions](link)

---

**Desenvolvido com ❤️ usando Next.js e TypeScript**
