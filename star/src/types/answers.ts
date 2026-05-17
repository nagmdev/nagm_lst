export interface Answer {
    id: number;
    situation: string;
    task: string;
    action: string;
    result: string;
    question: {
      id: number;
      text: string;
    };
  }