/* eslint-disable @typescript-eslint/no-unused-vars */
import Position from "./IPosition";
interface IUserProfile {
    name: string;
    email: string;
    resume?: string;
    positions: Position[];
  }
  export default IUserProfile;