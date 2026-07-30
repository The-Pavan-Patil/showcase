import { describe, expect, it } from "vitest";

import { applyKeyboardInput } from "@/lib/quick-message";

describe("quick message keyboard input", () => {
  it("appends virtual letter, number, and space keys", () => {
    let result = applyKeyboardInput("", "KeyH");
    result = applyKeyboardInput(result.message, "Digit1");
    result = applyKeyboardInput(result.message, "Space");
    result = applyKeyboardInput(result.message, "KeyI");

    expect(result).toEqual({ message: "h1 i", shouldSubmit: false });
  });

  it("deletes the last character on backspace", () => {
    expect(applyKeyboardInput("hello", "Backspace")).toEqual({
      message: "hell",
      shouldSubmit: false,
    });
  });

  it("requests submit on enter without changing the message", () => {
    expect(applyKeyboardInput("hello", "Enter")).toEqual({
      message: "hello",
      shouldSubmit: true,
    });
  });

  it("does not append beyond the max length", () => {
    expect(applyKeyboardInput("hello", "KeyX", 5)).toEqual({
      message: "hello",
      shouldSubmit: false,
    });
  });
});

