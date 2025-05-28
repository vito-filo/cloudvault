export class LoginOutputDto {
  accessToken: string;
  user: {
    id: number;
    email: string;
  };
}
