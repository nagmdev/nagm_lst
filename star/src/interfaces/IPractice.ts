export  interface StarResponse {
  situation: string;
  task: string;
  action: string;
  result: string;
  date: string;
  companyName?: string;
  leadershipPrincipleName?: string;
  text: string; // Add the 'text' property to match the definition in IPractice.ts
}
  export interface Question {
    id: number | null;
    text: string;
  }
  
  export interface QuestionSelectorProps {
    questions: Question[];
    selectedQuestionId: number | null;
    setSelectedQuestionId: (id: number | null) => void;
    loading: boolean;
    error: string | null;
  }
  
  export interface DecodedToken {
    sub: string; // User ID from JWT
  }
  



  export interface ResponseFormProps {
    response: StarResponse; // from IPractice.ts
    setResponse: React.Dispatch<React.SetStateAction<StarResponse>>; // expects date
    handleSubmit: () => void;
    handleInputChange: (field: keyof StarResponse, value: string) => void;
    loading: boolean;
  }
  
  