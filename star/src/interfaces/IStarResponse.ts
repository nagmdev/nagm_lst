/* eslint-disable @typescript-eslint/no-unused-vars */

interface IStarResponse {
  id?: number;
  questionId: number;
  situation: string;
  task: string;
  action: string;
  result: string;
  date: string;
  score?: number;
  aiReview?: string;
}

export default IStarResponse;