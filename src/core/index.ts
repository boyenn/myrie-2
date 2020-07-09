import { Observable } from "rxjs";

/**
 * Commandhandlers can either return nothing or a string. If a string is returned, it should be sent back to the requesting user.
 */
export type CommandHandler = (
  context: MyrieContext,
  ...args: string[]
) => Promise<void | string>;

export type MyrieContext = {
  config: Required<MyrieConfig>;
  replyFunction: ReplyFunction;
};

export type MyrieConfig = {
  argDelimiter: string;
  commandSymbol: string;
  replyFunction: ReplyFunction;
  input$: Observable<string>;
};

export type ReplyFunction = (
  context: MyrieContext,
  response: string
) => Promise<void>;
const defaultConfig = {
  argDelimiter: " ",
  commandSymbol: ".",
};

type InputConfig = {
  [K in keyof Omit<MyrieConfig, keyof typeof defaultConfig>]-?: MyrieConfig[K];
} &
  {
    [K in keyof Omit<
      MyrieConfig,
      keyof Omit<MyrieConfig, keyof typeof defaultConfig>
    >]?: MyrieConfig[K];
  };

interface CommandHandlerRegistry {
  [name: string]: CommandHandler | undefined;
}

const createCommandHandlerRegistrator = (
  commandHandlers: CommandHandlerRegistry
) => (name: string, commandHandler: CommandHandler) =>
  (commandHandlers[name] = commandHandler);

export type MyrieApplication = {
  registerCommandHandler: (
    name: string,
    commandHandler: CommandHandler
  ) => void;
};

export function createMyrie(inputConfig: InputConfig): MyrieApplication {
  const commandHandlers: CommandHandlerRegistry = {};
  const compiledConfig: MyrieConfig = {
    ...defaultConfig,
    ...inputConfig,
  };
  const myrieContext: MyrieContext = {
    config: compiledConfig,
    replyFunction: inputConfig.replyFunction,
  };

  const receiveInput = async (inputString: string) => {
    if (!inputString.startsWith(compiledConfig.commandSymbol)) {
      return;
    }
    const [delimitedName, ...args] = inputString.split(
      compiledConfig.argDelimiter
    );
    const [, name] = delimitedName.split(compiledConfig.commandSymbol);
    const commandHandler = commandHandlers[name];
    if (commandHandler == null) {
      return;
    }
    const returnValue = await commandHandler(myrieContext, ...args);
    if (returnValue != null) {
      await myrieContext.replyFunction(myrieContext, returnValue);
    }
  };

  // TODO: Check if we should swap to concatmapping ( maybe based on config?).
  // TODO: Teardown
  compiledConfig.input$.subscribe(receiveInput);

  return {
    registerCommandHandler: createCommandHandlerRegistrator(commandHandlers),
  };
}
