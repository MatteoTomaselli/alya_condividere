declare module 'nodemailer' {
  export interface TransportOptions {
    service?: string;
    auth?: {
      user?: string;
      pass?: string;
    };
  }

  export interface MailOptions {
    from?: string;
    to?: string;
    subject?: string;
    html?: string;
  }

  export interface Transporter {
    sendMail(mailOptions: MailOptions): Promise<any>;
  }

  function createTransport(options: TransportOptions): Transporter;
  export { createTransport };
}
