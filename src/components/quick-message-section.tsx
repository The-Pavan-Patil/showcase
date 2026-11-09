"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import {
  type FormEvent,
  type KeyboardEvent,
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
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
import { useMediaQuery } from "@/lib/use-scroll-scene";
import { clamp } from "@/lib/utils";

type QuickMessageCopy = UiCopy["home"]["quickMessage"];
type SubmitState = "idle" | "sending" | "sent" | "error";
/**
 * Phones compose in a compact band. Focusing the message opens the device
 * keyboard ("native"); pressing an on-screen key closes it and keeps typing
 * on screen ("virtual").
 */
type ComposeMode = "native" | "virtual";

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

/** Touch phones, where the device keyboard covers half the screen. */
const COMPOSE_QUERY = "(max-width: 760px) and (pointer: coarse)";
/**
 * Phones raise the keyboard with a CSS scroll-driven animation
 * (globals.css), which runs with the scroll instead of a frame behind it.
 */
const PHONE_RISE_QUERY = "(max-width: 760px) and (prefers-reduced-motion: no-preference)";
/** Scroll (px) the phone keyboard takes at least to lie flat. */
const PHONE_MIN_RISE = 96;
/** Height (px) of the message box while composing: 4.75rem in globals.css. */
const COMPOSE_TEXTAREA_HEIGHT = 76;
/** Space (px) kept between the on-screen keyboard and the device keyboard. */
const COMPOSE_BOTTOM_GAP = 16;
const COMPOSE_MIN_ZOOM = 0.5;
/** Scroll (px) inside the band's pinned range that composing lands at. */
const PIN_INSET = 4;

function canCompose() {
  return window.matchMedia(COMPOSE_QUERY).matches;
}

function supportsScrollRise() {
  return typeof CSS !== "undefined" && CSS.supports("animation-timeline: view()");
}

/** The phone keyboard's width-based zoom, calc(90vw / 400px) in globals.css. */
function phoneKeyboardZoom() {
  return (window.innerWidth * 0.9) / 400;
}

/**
 * Height the band gives up as it folds into its compact layout
 * (globals.css): the title, the label, the character count and part of the
 * message box. Mid-fold, this is what is still left to go.
 */
function foldingSpace(band: HTMLElement, textarea: HTMLTextAreaElement) {
  const title = band.querySelector<HTMLElement>(".quick-message-copy h2");
  const label = band.querySelector<HTMLElement>(".quick-message-label");
  const meta = band.querySelector<HTMLElement>(".quick-message-meta");
  const count = meta?.querySelector<HTMLElement>(":scope > span");
  const px = (value: string) => Number.parseFloat(value) || 0;

  return (
    (title ? title.offsetHeight + px(getComputedStyle(title).marginTop) : 0) +
    (label ? label.offsetHeight + px(getComputedStyle(label).marginBottom) : 0) +
    (meta && count ? count.offsetHeight + px(getComputedStyle(meta).rowGap) : 0) +
    Math.max(0, textarea.offsetHeight - COMPOSE_TEXTAREA_HEIGHT)
  );
}

/**
 * Composing keeps the band pinned at the top of the screen, so scroll into
 * its pinned range if the page is short of it (or past it).
 */
function pinBand(band: HTMLElement | null, track: HTMLElement | null) {
  if (!band || !track) return;

  const style = getComputedStyle(band);
  if (style.position !== "sticky") {
    // Reduced motion: the band scrolls with the page.
    window.scrollBy({ top: band.getBoundingClientRect().top - 16, behavior: "instant" });
    return;
  }

  const pinTop = Number.parseFloat(style.top) || 0;
  const trackBox = track.getBoundingClientRect();
  // A few pixels inside the range, so a snapped scroll offset still pins.
  const from = trackBox.top + window.scrollY - pinTop + PIN_INSET;
  const to = Math.max(from, trackBox.bottom + window.scrollY - band.offsetHeight - pinTop - PIN_INSET);
  const target = clamp(window.scrollY, from, to);
  if (Math.abs(target - window.scrollY) > 1) {
    window.scrollTo({ top: target, behavior: "instant" });
  }
}

export function QuickMessageSection({ copy }: { copy: QuickMessageCopy }) {
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [statusMessage, setStatusMessage] = useState(copy.helper);
  const [compose, setCompose] = useState<ComposeMode | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const bandRef = useRef<HTMLFormElement>(null);
  const keyboardRef = useRef<HTMLDivElement>(null);
  // Whether the last touch went down on the on-screen keyboard: that is
  // the message losing focus to it, not the visitor leaving.
  const pointerOnKeyboard = useRef(false);
  const isComposing = compose !== null;

  const stopComposing = useCallback(() => {
    setCompose(null);
    if (document.activeElement === textareaRef.current) textareaRef.current?.blur();
  }, []);

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
        // On a phone this would reopen the device keyboard.
        if (!canCompose()) textareaRef.current?.focus();
      } catch {
        setSubmitState("error");
        setStatusMessage(copy.deliveryError);
      }
    },
    [copy, message, website],
  );

  // Composing starts with the band pinned at the top of the screen.
  useLayoutEffect(() => {
    if (isComposing) pinBand(bandRef.current, scrollTrackRef.current);
  }, [isComposing]);

  // While composing, the band follows the visible part of the screen (the
  // device keyboard covers the rest) and the keyboard is sized to fit there.
  useEffect(() => {
    const band = bandRef.current;
    if (!isComposing || !band) return;

    const viewport = window.visualViewport;
    const camera = band.querySelector<HTMLElement>(".quick-message-keyboard-camera");
    const keyboardRoot = keyboardRef.current?.querySelector<HTMLElement>(":scope > div");
    const textarea = textareaRef.current;
    let smallestView = Number.POSITIVE_INFINITY;
    let frame = 0;

    const fit = () => {
      frame = 0;
      const viewTop = viewport?.offsetTop ?? 0;
      // The device keyboard closes once the on-screen keys are used; they
      // keep the size they had above it, so nothing moves under a finger.
      smallestView = Math.min(smallestView, viewport?.height ?? window.innerHeight);
      band.style.setProperty("--quick-message-view-top", `${viewTop}px`);
      if (!camera || !keyboardRoot?.offsetHeight || !textarea) return;

      const pinTop = (Number.parseFloat(getComputedStyle(band).top) || 0) - viewTop;
      // Measured against the compact layout the band is folding into, so
      // the size is settled from the first frame of the fold.
      const keyboardTop = camera.offsetTop - foldingSpace(band, textarea);
      const room = smallestView - pinTop - keyboardTop - COMPOSE_BOTTOM_GAP;
      const widthZoom = phoneKeyboardZoom();
      const zoom = clamp(room / keyboardRoot.offsetHeight, Math.min(COMPOSE_MIN_ZOOM, widthZoom), widthZoom);
      band.style.setProperty("--quick-message-compose-zoom", zoom.toFixed(3));
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(fit);
    };

    fit();
    viewport?.addEventListener("resize", schedule);
    viewport?.addEventListener("scroll", schedule);
    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(band);

    return () => {
      viewport?.removeEventListener("resize", schedule);
      viewport?.removeEventListener("scroll", schedule);
      resizeObserver.disconnect();
      window.cancelAnimationFrame(frame);
      band.style.removeProperty("--quick-message-view-top");
      band.style.removeProperty("--quick-message-compose-zoom");
    };
  }, [isComposing]);

  // Composing ends on a tap outside the band, or once it scrolls away.
  useEffect(() => {
    const band = bandRef.current;
    const track = scrollTrackRef.current;
    if (!isComposing || !band || !track) return;

    const handlePointerDown = (event: PointerEvent) => {
      pointerOnKeyboard.current = Boolean(
        keyboardRef.current?.contains(event.target as Node | null),
      );
    };
    // A click, not a touch: a drag that scrolls the page keeps composing.
    const handleClick = (event: MouseEvent) => {
      if (!band.contains(event.target as Node | null)) stopComposing();
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry && !entry.isIntersecting) stopComposing();
    });

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("click", handleClick, true);
    observer.observe(track);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("click", handleClick, true);
      observer.disconnect();
      pointerOnKeyboard.current = false;
    };
  }, [isComposing, stopComposing]);

  // Text typed on screen goes in without a caret; keep its end in view.
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea && document.activeElement !== textarea) {
      textarea.scrollTop = textarea.scrollHeight;
    }
  }, [message]);

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
    // On a phone the on-screen keyboard takes over from the device keyboard,
    // which closes. Elsewhere focus returns to the message so physical keys
    // keep typing there.
    const typesOnScreen = canCompose();
    if (typesOnScreen) {
      setCompose((mode) => mode && "virtual");
      if (document.activeElement === textareaRef.current) textareaRef.current?.blur();
    }

    if (next.shouldSubmit) {
      void submitMessage(next.message);
      return;
    }

    setMessage(next.message);
    setSubmitState("idle");
    setStatusMessage(copy.helper);
    if (!typesOnScreen) textareaRef.current?.focus();
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
          <form
            ref={bandRef}
            className="quick-message-band"
            data-compose={compose ?? undefined}
            onSubmit={handleSubmit}
          >
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
              enterKeyHint="send"
              onChange={(event) => {
                setMessage(event.target.value);
                setSubmitState("idle");
                setStatusMessage(copy.helper);
              }}
              onFocus={() => {
                if (canCompose()) setCompose("native");
              }}
              onBlur={() => {
                setCompose((mode) => mode && (pointerOnKeyboard.current ? "virtual" : null));
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
            shellRef={keyboardRef}
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
  shellRef,
  onVirtualKeyPress,
}: {
  ariaLabel: string;
  scrollTrackRef: RefObject<HTMLDivElement | null>;
  shellRef: RefObject<HTMLDivElement | null>;
  onVirtualKeyPress: (keyCode: string) => void;
}) {
  const [entryScale, setEntryScale] = useState(1);
  // Track progress at which the band pins, where the keyboard has settled.
  const [settleAt, setSettleAt] = useState(0.34);
  const reduceMotion = useReducedMotion();
  const risesInCss = useMediaQuery(PHONE_RISE_QUERY) && supportsScrollRise();
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
    const shell = shellRef.current;
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

      // Phones: the keyboard starts to lie flat as it clears the tab bar,
      // so the whole tilt plays where it can be seen, and is flat as the
      // band pins.
      const tabBar = document.querySelector<HTMLElement>(".mobile-tab-bar");
      const tabBarClearance = tabBar?.getClientRects().length
        ? Math.max(0, viewportHeight - tabBar.getBoundingClientRect().top)
        : 0;
      const riseStart = Math.min(
        camera.offsetTop + tabBarClearance,
        viewportHeight - stickyTop - PHONE_MIN_RISE,
      );
      band.style.setProperty("--quick-message-rise-start", `${Math.max(0, riseStart)}px`);
    };

    measure();
    const resizeObserver = new ResizeObserver(measure);
    [shell, keyboardRoot, band, track].forEach((element) => resizeObserver.observe(element));
    window.addEventListener("resize", measure);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [scrollTrackRef, shellRef]);

  // The keyboard rises in tilted and lies flat by the time the band pins, so
  // it moves with the scroll instead of shrinking in place afterwards.
  const tiltFrom = Math.max(0, settleAt - KEYBOARD_TILT_SPAN);
  const rotateX = useTransform(smoothProgress, [tiltFrom, settleAt], [40, 0]);
  const scale = useTransform(smoothProgress, [tiltFrom, settleAt], [entryScale, 1]);
  const cameraY = useTransform(smoothProgress, [tiltFrom, settleAt], [18, 0]);

  return (
    <motion.div
      className="quick-message-keyboard-camera"
      // On phones the CSS animation drives the transform.
      style={
        risesInCss
          ? undefined
          : reduceMotion
            ? { rotateX: 0, scale: 1, y: 0 }
            : { rotateX, scale, y: cameraY }
      }
    >
      <div
        ref={shellRef}
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
