export interface Question {
  id: string;
  content: string;
  likes: number;
  liked: boolean;
  answered: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuestionRequest {
  content: string;
}

export interface QuestionsResponse {
  questions: Question[];
}

export interface QuestionResponse {
  question: Question;
}

export interface LikeResponse {
  success: boolean;
  likes: number;
  liked: boolean;
}
