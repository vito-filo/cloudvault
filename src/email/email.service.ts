import { Inject, Injectable } from '@nestjs/common';
import {
  SESClient,
  SendEmailCommand,
  SendEmailCommandInput,
} from '@aws-sdk/client-ses';

@Injectable()
export class EmailService {
  constructor(@Inject('SES_CLIENT') private readonly sesClient: SESClient) {}

  async sendVerificationEmail(receiver: string, code: string): Promise<void> {
    const config: SendEmailCommandInput = {
      Source: 'noreply@cloudvault.filomenodev.studio',
      Destination: {
        ToAddresses: [receiver],
      },
      Message: {
        Subject: {
          Data: 'CloudVault Account Verification',
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: `<html>
            <body>
              <p>Your verification code is <strong>${code}</strong>.</p>
            </body>
          </html>`,
          },
        },
      },
    };

    try {
      const command = new SendEmailCommand(config);
      await this.sesClient.send(command);
      console.log('Verification email sent successfully to:', receiver);
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw error;
    }
  }
}
