import { ReplyFunction } from "src/core";

export const consoleReply: ReplyFunction = async (_, response) =>
  console.log("REPLY:", response);
