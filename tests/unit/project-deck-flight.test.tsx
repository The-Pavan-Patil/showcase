import { describe, expect, it } from "vitest";

import {
  easeDeckRelease,
  resolveCardFlight,
  resolveFlightProgress,
  resolveReleaseScroll,
  resolveRestScale,
  type DeckPose,
  type DeckRect,
} from "@/app/_pages/home/_components/project-deck-flight";
import { getScrollAccentActivationY } from "@/components/scroll-accent";

// A featured card whose grid slot sits 1500px down the document.
const natural: DeckRect = {
  left: 100,
  docTop: 1500,
  width: 1000,
  height: 500,
};

// The hero deck box: 440px wide, starting 150px down the page.
const deck: DeckRect = {
  left: 700,
  docTop: 150,
  width: 440,
  height: 530,
};

/** -0 is numerically identity (-0 === 0) but toEqual treats it as distinct. */
function normalizeZeros(flight: Record<string, number>) {
  return Object.fromEntries(
    Object.entries(flight).map(([key, value]) => [key, value === 0 ? 0 : value]),
  );
}

const pose: DeckPose = {
  centerX: 0.5,
  centerY: 0.5,
  rotate: 6,
  slotWidth: 0.9,
  slotHeight: 0.9,
};

describe("easeDeckRelease", () => {
  it("is back-loaded so the deck holds its fanned pose before releasing", () => {
    expect(easeDeckRelease(0)).toBe(0);
    expect(easeDeckRelease(1)).toBe(1);
    // Half way through the scroll the fan should be far less than half resolved.
    expect(easeDeckRelease(0.5)).toBeLessThan(0.3);
    expect(easeDeckRelease(0.9)).toBeGreaterThan(0.9);
  });

  it("increases monotonically", () => {
    let previous = -1;
    for (let step = 0; step <= 20; step += 1) {
      const value = easeDeckRelease(step / 20);
      expect(value).toBeGreaterThanOrEqual(previous);
      previous = value;
    }
  });
});

describe("resolveReleaseScroll", () => {
  it("lands the deck exactly when the accent dot reaches the eyebrow", () => {
    // The dot rests on a waypoint once the page has scrolled it up to the
    // activation line, so release must be anchorDocY - activationY.
    const anchorDocY = 1150;
    const viewportHeight = 900;
    const activationY = getScrollAccentActivationY(viewportHeight);

    expect(resolveReleaseScroll(anchorDocY, viewportHeight)).toBe(
      anchorDocY - activationY,
    );
    // Mirrors site-header's own scroll target for the same anchor.
    expect(activationY).toBeCloseTo(342, 5);
  });

  it("is fully landed by the time the dot arrives, never after", () => {
    const anchorDocY = 1150;
    const viewportHeight = 900;
    const dotArrivesAt =
      anchorDocY - getScrollAccentActivationY(viewportHeight);
    const releaseScroll = resolveReleaseScroll(anchorDocY, viewportHeight);

    expect(resolveFlightProgress(dotArrivesAt, releaseScroll)).toBe(1);
  });

  it("stays positive for anchors near the top of the document", () => {
    expect(resolveReleaseScroll(10, 900)).toBe(1);
  });

  it("floors, so a fractional anchor still settles by the dot's arrival", () => {
    const viewportHeight = 900;
    const anchorDocY = 1113.5;
    const releaseScroll = resolveReleaseScroll(anchorDocY, viewportHeight);
    const dotArrivesAt = Math.floor(
      anchorDocY - getScrollAccentActivationY(viewportHeight),
    );

    expect(releaseScroll).toBe(771);
    expect(resolveFlightProgress(dotArrivesAt, releaseScroll)).toBe(1);
  });
});

describe("resolveFlightProgress", () => {
  it("runs from the top of the page to the release point", () => {
    expect(resolveFlightProgress(0, 808)).toBe(0);
    expect(resolveFlightProgress(808, 808)).toBe(1);
    expect(resolveFlightProgress(404, 808)).toBeCloseTo(0.5, 10);
  });

  it("clamps outside the flight", () => {
    expect(resolveFlightProgress(-200, 808)).toBe(0);
    expect(resolveFlightProgress(99999, 808)).toBe(1);
  });

  it("reports a completed flight when there is no runway", () => {
    expect(resolveFlightProgress(0, 0)).toBe(1);
  });

  it("is shared by every card, so the deck lands together", () => {
    // One scroll position yields one progress regardless of which card is
    // being placed — this is what keeps the three cards in sync.
    const progress = resolveFlightProgress(700, 808);
    expect(resolveFlightProgress(700, 808)).toBe(progress);
  });
});

describe("resolveRestScale", () => {
  it("fits the card to the deck box on both axes", () => {
    // Width fit 440*0.9/1000 = 0.396; height fit 530*0.9/500 = 0.954.
    expect(resolveRestScale(natural, deck, pose)).toBeCloseTo(0.396, 6);
  });

  it("is height limited for tall half-width cards", () => {
    const tall: DeckRect = { left: 0, docTop: 2000, width: 560, height: 720 };
    const halfPose: DeckPose = { ...pose, slotWidth: 0.62, slotHeight: 0.6 };

    // Width fit 440*0.62/560 = 0.487; height fit 530*0.6/720 = 0.4417.
    expect(resolveRestScale(tall, deck, halfPose)).toBeCloseTo(0.4417, 4);
  });

  it("falls back to 1 before layout has produced a size", () => {
    expect(resolveRestScale({ ...natural, width: 0 }, deck, pose)).toBe(1);
    expect(resolveRestScale({ ...natural, height: 0 }, deck, pose)).toBe(1);
  });
});

describe("resolveCardFlight", () => {
  it("rests the card on its deck slot at the top of the page", () => {
    const flight = resolveCardFlight(natural, deck, pose, 0, 0);

    const naturalCenterX = natural.left + natural.width / 2;
    const naturalCenterY = natural.docTop + natural.height / 2;

    expect(naturalCenterX + flight.x).toBeCloseTo(
      deck.left + deck.width * pose.centerX,
      5,
    );
    expect(naturalCenterY + flight.y).toBeCloseTo(
      deck.docTop + deck.height * pose.centerY,
      5,
    );
    expect(flight.rotate).toBeCloseTo(pose.rotate, 5);
    expect(flight.scale).toBeCloseTo(0.396, 5);
  });

  it("lands on exact identity at progress 1", () => {
    const flight = resolveCardFlight(natural, deck, pose, 808, 1);

    expect(normalizeZeros(flight)).toEqual({ x: 0, y: 0, scale: 1, rotate: 0 });
  });

  it("stays at identity once landed, at any scroll position", () => {
    for (const scrollY of [808, 2000, 100000]) {
      expect(
        normalizeZeros(resolveCardFlight(natural, deck, pose, scrollY, 1)),
      ).toEqual({
        x: 0,
        y: 0,
        scale: 1,
        rotate: 0,
      });
    }
  });

  it("unfans rotation and grows scale monotonically toward the grid", () => {
    let previousRotate = Number.POSITIVE_INFINITY;
    let previousScale = -1;

    for (let step = 0; step <= 20; step += 1) {
      const progress = step / 20;
      const flight = resolveCardFlight(natural, deck, pose, 0, progress);

      expect(flight.rotate).toBeLessThanOrEqual(previousRotate + 1e-9);
      expect(flight.scale).toBeGreaterThanOrEqual(previousScale - 1e-9);
      previousRotate = flight.rotate;
      previousScale = flight.scale;
    }
  });

  it("tracks the grid slot as the page scrolls, so the card holds the deck line", () => {
    // At progress 0 the card must sit on the deck line no matter how far the
    // page has scrolled — the offset absorbs the slot's movement.
    const deckLine = deck.docTop + deck.height * pose.centerY;

    for (const scrollY of [0, 200, 600, 1200]) {
      const flight = resolveCardFlight(natural, deck, pose, scrollY, 0);
      const viewportCenterY =
        natural.docTop + natural.height / 2 - scrollY + flight.y;

      expect(viewportCenterY).toBeCloseTo(deckLine, 5);
    }
  });
});
