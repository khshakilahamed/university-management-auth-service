import nodemailer from 'nodemailer';
import config from '../../../config';

export async function sendEmail(to: string, html: string) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      // TODO: replace `user` and `pass` values from <https://forwardemail.net>
      user: config.email,
      pass: config.app_pass,
    },
  });

  await transporter.sendMail({
    from: config.email, // sender address
    to: to, // list of receivers
    subject: 'Reset Password Link', // Subject line
    html: html, // html body
  });
}
