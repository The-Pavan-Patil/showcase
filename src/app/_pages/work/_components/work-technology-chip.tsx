"use client";

import { Chip } from "@heroui/react";

export function WorkTechnologyChip({ label }: { label: string }) {
  return <Chip variant="secondary">{label}</Chip>;
}
