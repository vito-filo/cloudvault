import { Inject, Injectable } from '@nestjs/common';
import {
  SESClient,
  SendEmailCommand,
  SendEmailCommandInput,
} from '@aws-sdk/client-ses';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly source: string;

  constructor(
    @Inject('SES_CLIENT') private readonly sesClient: SESClient,
    private readonly configService: ConfigService,
  ) {
    this.source = configService.get<string>('EMAIL_SOURCE', 'undefined');
  }

  async sendVerificationEmail(receiver: string, code: string): Promise<void> {
    const config: SendEmailCommandInput = {
      Source: this.source,
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
