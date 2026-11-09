"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import {
  type FormEvent,
  type KeyboardEvent,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { Keyboard } from "@/components/ui/keyboard";
import { Container } from "@/components/container";
import { onSectionJumpEnd } from "@/lib/section-jump";
import {
  applyKeyboardInput,
  QUICK_MESSAGE_MAX_LENGTH,
} from "@/lib/quick-message";
import { formatCopy, type UiCopy } from "@/lib/ui-copy";
import { clamp } from "@/lib/utils";

type QuickMessageCopy = UiCopy["home"]["quickMessage"];
type SubmitState = "idle" | "sending" | "sent" | "error";

/** Space (px) kept under the keyboard while the band is pinned. */
const KEYBOARD_BOTTOM_GAP = 24;
const KEYBOARD_MIN_ZOOM = 0.8;
const KEYBOARD_MAX_ZOOM = 3.2;
/** Share of the room under the composer the keyboard fills. */
const KEYBOARD_FILL = 0.85;
/** Largest scale the keyboard enters at before settling to its fitted size. */
const KEYBOARD_ENTRY_SCALE = 1.15;
/** Share of the track's progress the keyboard takes to lie flat. */
const KEYBOARD_TILT_SPAN = 0.18;


export function QuickMessageSection({ copy }: { copy: QuickMessageCopy }) {
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [statusMessage, setStatusMessage] = useState(copy.helper);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollTrackRef = useRef<HTMLDivElement>(null);

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
        <div ref={scrollTrackRef} className="quick-message-scroll-track">
          <form className="quick-message-band" onSubmit={handleSubmit}>
          <div className="quick-message-copy">
            <p className="eyebrow scroll-accent-eyebrow">
              <span
                className="scroll-accent-heading-target"
                data-scroll-accent-anchor="message"
                data-scroll-accent-phase="heading"
                aria-hidden="true"
              />
              {copy.eyebrow}
            </p>
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

          <ScrollKeyboard
            ariaLabel={copy.keyboardAria}
            scrollTrackRef={scrollTrackRef}
            onVirtualKeyPress={handleVirtualKeyPress}
          />
          </form>
        </div>
      </Container>
    </section>
  );
}

function ScrollKeyboard({
  ariaLabel,
  scrollTrackRef,
  onVirtualKeyPress,
}: {
  ariaLabel: string;
  scrollTrackRef: RefObject<HTMLDivElement | null>;
  onVirtualKeyPress: (keyCode: string) => void;
}) {
  const keyboardShellRef = useRef<HTMLDivElement>(null);
  const [entryScale, setEntryScale] = useState(1);
  // Track progress at which the band pins, where the keyboard has settled.
  const [settleAt, setSettleAt] = useState(0.34);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: scrollTrackRef,
    offset: ["start end", "end start"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 150,
    damping: 30,
    mass: 0.18,
  });
  // After a header jump the keyboard is already where the scroll puts it.
  useEffect(
    () => onSectionJumpEnd(() => smoothProgress.jump(scrollYProgress.get())),
    [scrollYProgress, smoothProgress],
  );

  useEffect(() => {
    const shell = keyboardShellRef.current;
    const keyboardRoot = shell?.querySelector<HTMLElement>(":scope > div");
    const camera = shell?.parentElement;
    const band = shell?.closest<HTMLElement>(".quick-message-band");
    const track = scrollTrackRef.current;
    if (!shell || !keyboardRoot || !camera || !band || !track) return;

    const measure = () => {
      const viewportHeight = window.innerHeight;
      const bandStyle = getComputedStyle(band);
      const isPinned = bandStyle.position === "sticky";
      const stickyTop = isPinned ? Number.parseFloat(bandStyle.top) || 0 : 0;

      // On wider screens the keyboard takes most of the room left under the
      // composer while the band is pinned, as wide as the column allows.
      const naturalWidth = keyboardRoot.offsetWidth;
      const naturalHeight = keyboardRoot.offsetHeight;
      if (naturalWidth && naturalHeight) {
        const roomBelow = isPinned
          ? viewportHeight - stickyTop - camera.offsetTop - KEYBOARD_BOTTOM_GAP
          : viewportHeight - 2 * KEYBOARD_BOTTOM_GAP;
        const fit = clamp(
          Math.min(shell.clientWidth / naturalWidth, roomBelow / naturalHeight) *
            KEYBOARD_FILL,
          KEYBOARD_MIN_ZOOM,
          KEYBOARD_MAX_ZOOM,
        );
        shell.style.setProperty("--quick-message-keyboard-fit", fit.toFixed(3));
      }

      const zoom = Number.parseFloat(getComputedStyle(keyboardRoot).zoom || "1");
      const finalWidth = naturalWidth * zoom;
      if (finalWidth) {
        setEntryScale(clamp(shell.clientWidth / finalWidth, 1, KEYBOARD_ENTRY_SCALE));
      }

      setSettleAt(
        clamp((viewportHeight - stickyTop) / (track.offsetHeight + viewportHeight)),
      );
    };

    measure();
    const resizeObserver = new ResizeObserver(measure);
    [shell, keyboardRoot, band, track].forEach((element) => resizeObserver.observe(element));
    window.addEventListener("resize", measure);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [scrollTrackRef]);

  // The keyboard rises in tilted and lies flat by the time the band pins, so
  // it moves with the scroll instead of shrinking in place afterwards.
  const tiltFrom = Math.max(0, settleAt - KEYBOARD_TILT_SPAN);
  const rotateX = useTransform(smoothProgress, [tiltFrom, settleAt], [40, 0]);
  const scale = useTransform(smoothProgress, [tiltFrom, settleAt], [entryScale, 1]);
  const cameraY = useTransform(smoothProgress, [tiltFrom, settleAt], [18, 0]);

  return (
    <motion.div
      className="quick-message-keyboard-camera"
      style={
        reduceMotion
          ? { rotateX: 0, scale: 1, y: 0 }
          : { rotateX, scale, y: cameraY }
      }
    >
      <div
        ref={keyboardShellRef}
        className="quick-message-keyboard"
        role="group"
        aria-label={ariaLabel}
      >
        <Keyboard
          enableSound
          showPreview
          onVirtualKeyPress={onVirtualKeyPress}
        />
      </div>
    </motion.div>
  );
}

function getErrorMessage(status: number, copy: QuickMessageCopy) {
  if (status === 400) return copy.emptyError;
  if (status === 429) return copy.rateLimitError;
  if (status === 503) return copy.notConfiguredError;

  return copy.deliveryError;
}
