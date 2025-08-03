import { mailtrapClient, sender } from "../mailtrap/mailtrap.config.js";

export const sendVerificationEmail = async (email, name, verificationCode) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Verify your email",
      text: `Hello, ${name} \nThis is your verfication code: ${verificationCode}`,
      category: "Email Verification",
    });
    console.log("Verification Email sent successfully", response);
  } catch (error) {
    console.error("Error sending verification email", error);
    throw new Error("Error sending verfication email: ", error);
  }
};

export const sendWelcomeEmail = async (email, name) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Welcome to meal-sync Family",
      text: `Congratulations, ${name} \nYou have been verified. Thank you for being with meal sync`,
      category: "Welcome Email",
    });
    console.log("Welcome Email sent successfully", response);
  } catch (error) {
    console.error("Error sending welcome email", error);
    throw new Error("Error sending welcome email: ", error);
  }
};
