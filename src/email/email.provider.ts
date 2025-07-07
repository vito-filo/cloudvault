import { SESClient } from '@aws-sdk/client-ses';
import { Provider } from '@nestjs/common';

export const EmailProvider: Provider = {
  provide: 'SES_CLIENT',
  useFactory: () => {
    return new SESClient();
  },
};
