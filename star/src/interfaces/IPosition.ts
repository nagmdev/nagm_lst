/* eslint-disable @typescript-eslint/no-unused-vars */
import StarResponse from "./IStarResponse";

interface IPosition {
    title: string;
    company: string;
    location?: string;
    date: string;
    responses: StarResponse[];
  }

  export default IPosition;