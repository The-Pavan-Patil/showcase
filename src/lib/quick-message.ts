export const QUICK_MESSAGE_MAX_LENGTH = 500;

const keyInputByCode: Record<string, string> = {
  Backquote: "`",
  Digit1: "1",
  Digit2: "2",
  Digit3: "3",
  Digit4: "4",
  Digit5: "5",
  Digit6: "6",
  Digit7: "7",
  Digit8: "8",
  Digit9: "9",
  Digit0: "0",
  Minus: "-",
  Equal: "=",
  BracketLeft: "[",
  BracketRight: "]",
  Backslash: "\\",
  Semicolon: ";",
  Quote: "'",
  Comma: ",",
  Period: ".",
  Slash: "/",
  Space: " ",
};

export type KeyboardInputResult = {
  message: string;
  shouldSubmit: boolean;
};

export function applyKeyboardInput(
  currentMessage: string,
  keyCode: string,
  maxLength = QUICK_MESSAGE_MAX_LENGTH,
): KeyboardInputResult {
  if (keyCode === "Enter") {
    return { message: currentMessage, shouldSubmit: true };
  }

  if (keyCode === "Backspace") {
    return { message: currentMessage.slice(0, -1), shouldSubmit: false };
  }

  if (keyCode.startsWith("Key") && keyCode.length === 4) {
    return appendCharacter(currentMessage, keyCode.slice(3).toLowerCase(), maxLength);
  }

  const character = keyInputByCode[keyCode];

  if (!character) {
    return { message: currentMessage, shouldSubmit: false };
  }

  return appendCharacter(currentMessage, character, maxLength);
}

function appendCharacter(
  currentMessage: string,
  character: string,
  maxLength: number,
): KeyboardInputResult {
  if (currentMessage.length >= maxLength) {
    return { message: currentMessage, shouldSubmit: false };
  }

  return {
    message: `${currentMessage}${character}`.slice(0, maxLength),
    shouldSubmit: false,
  };
}

