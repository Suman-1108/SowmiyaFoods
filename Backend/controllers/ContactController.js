import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const sendContactEmail = async (req, res) => {
  const { name, email, address, phone, subject, message } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", // or your preferred email service
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
      },
    });

    const mailOptions = {
      from: email,
      to: process.env.EMAIL_USER, // your email
      subject: subject || `Contact Form Submission from ${name}`,
      text: `
      Name: ${name}
      Email: ${email}
      Address: ${address}
      Phone: ${phone}
      Message: ${message}
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Email sent successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send email", error: err });
  }
};
