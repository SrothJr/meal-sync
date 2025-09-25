import { MailtrapClient } from "mailtrap";
import dotenv from "dotenv";

dotenv.config();
// fix this using dotenv later

console.log("MAILTRAP_ENDPOINT:", process.env.MAILTRAP_ENDPOINT);
console.log("MAILTRAP_TOKEN:", process.env.MAILTRAP_TOKEN);

export const mailtrapClient = new MailtrapClient({
  endpoint: "send.api.mailtrap.io",
  token: "6a259aa6bdbbe43761f935b967b1ce26",
});

export const sender = {
  email: "hello@demomailtrap.co",
  name: "meal sync",
};
