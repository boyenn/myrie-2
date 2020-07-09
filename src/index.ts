import { createMyrie } from "./core";
import { ping } from "./commands/ping";
import { consoleReply } from "./output/console.output";
import { createConsoleReadStream } from "./input/console.input";

const { registerCommandHandler } = createMyrie({
  replyFunction: consoleReply,
  input$: createConsoleReadStream(),
});

registerCommandHandler("ping", ping);
