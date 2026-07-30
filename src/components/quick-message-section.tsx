"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";
import { type FormEvent, type KeyboardEvent, useCallback, useRef, useState } from "react";

import { Keyboard } from "@/components/ui/keyboard";
import { Container } from "@/components/container";
import {
  applyKeyboardInput,
  QUICK_MESSAGE_MAX_LENGTH,
} from "@/lib/quick-message";
import { formatCopy, type UiCopy } from "@/lib/ui-copy";

type QuickMessageCopy = UiCopy["home"]["quickMessage"];
type SubmitState = "idle" | "sending" | "sent" | "error";

export function QuickMessageSection({ copy }: { copy: QuickMessageCopy }) {
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [statusMessage, setStatusMessage] = useState(copy.helper);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const submitMessage = useCallback(
    async (messageToSend = message) => {
      const trimmedMessage = messageToSend.trim();

      if (!trimmedMessage) {
        setSubmitState("error");
        setStatusMessage(copy.emptyError);
        return;
      }

      if (trimmedMessage.length > QUICK_MESSAGE_MAX_LENGTH) {
        setSubmitState("error");
        setStatusMessage(copy.tooLongError);
        return;
      }

      setSubmitState("sending");
      setStatusMessage(copy.sending);

      try {
        const response = await fetch("/api/message", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ message: trimmedMessage, website }),
        });

        if (!response.ok) {
          setSubmitState("error");
          setStatusMessage(getErrorMessage(response.status, copy));
          return;
        }

        setMessage("");
        setSubmitState("sent");
        setStatusMessage(copy.sent);
        textareaRef.current?.focus();
      } catch {
        setSubmitState("error");
        setStatusMessage(copy.deliveryError);
      }
    },
    [copy, message, website],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitMessage();
  };

  const handleTextareaKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter") return;

    event.preventDefault();
    void submitMessage(event.currentTarget.value);
  };

  const handleVirtualKeyPress = (keyCode: string) => {
    const next = applyKeyboardInput(message, keyCode);

    if (next.shouldSubmit) {
      void submitMessage(next.message);
      return;
    }

    setMessage(next.message);
    setSubmitState("idle");
    setStatusMessage(copy.helper);
    textareaRef.current?.focus();
  };

  const isSending = submitState === "sending";
  const isSent = submitState === "sent";
  const isError = submitState === "error";

  return (
    <section
      className="quick-message-section"
      aria-labelledby="quick-message-heading"
      data-quick-message-section
    >
      <Container>
        <form className="quick-message-band" onSubmit={handleSubmit}>
          <div className="quick-message-copy">
            <p className="eyebrow">{copy.eyebrow}</p>
            <h2 id="quick-message-heading">
              {copy.title}
              <span>{copy.muted}</span>
            </h2>
            <p>{copy.description}</p>
          </div>

          <div className="quick-message-composer">
            <label className="quick-message-label" htmlFor="quick-message-textarea">
              {copy.textareaLabel}
            </label>
            <textarea
              ref={textareaRef}
              id="quick-message-textarea"
              className="quick-message-textarea"
              value={message}
              maxLength={QUICK_MESSAGE_MAX_LENGTH}
              placeholder={copy.placeholder}
              onChange={(event) => {
                setMessage(event.target.value);
                setSubmitState("idle");
                setStatusMessage(copy.helper);
              }}
              onKeyDown={handleTextareaKeyDown}
              disabled={isSending}
            />
            <label className="quick-message-trap" aria-hidden="true">
              {copy.honeypotLabel}
              <input
                name="website"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </label>

            <div className="quick-message-meta">
              <p
                className="quick-message-status"
                data-state={submitState}
                role={isError ? "alert" : "status"}
                aria-live="polite"
              >
                {isSent ? <CheckCircle2 aria-hidden="true" size={15} /> : null}
                {isError ? <AlertCircle aria-hidden="true" size={15} /> : null}
                {statusMessage}
              </p>
              <span>
                {formatCopy(copy.characterCount, { count: String(message.length) })}
              </span>
            </div>
          </div>

          <div
            className="quick-message-keyboard"
            role="group"
            aria-label={copy.keyboardAria}
          >
            <Keyboard
              enableSound
              showPreview
              onVirtualKeyPress={handleVirtualKeyPress}
            />
          </div>
        </form>
      </Container>
    </section>
  );
}

function getErrorMessage(status: number, copy: QuickMessageCopy) {
  if (status === 400) return copy.emptyError;
  if (status === 429) return copy.rateLimitError;
  if (status === 503) return copy.notConfiguredError;

  return copy.deliveryError;
}
