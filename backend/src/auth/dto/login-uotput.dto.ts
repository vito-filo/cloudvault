export class LoginOutputDto {
  accessToken: string;
  user: {
    id: string;
    email: string;
  };
}
