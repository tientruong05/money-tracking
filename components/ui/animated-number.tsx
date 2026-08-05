"use client";

import { useEffect, useState } from "react";
import { animate, useMotionValue, useTransform } from "motion/react";

export function AnimatedNumber({ value, formatter }: { value: number; formatter: (n: number) => string }) {
  const motionValue = useMotionValue(value);
  const rounded = useTransform(motionValue, (v) => formatter(Math.round(v)));
  const [display, setDisplay] = useState(() => formatter(value));

  useEffect(() => {
    const controls = animate(motionValue, value, { duration: 0.6, ease: "easeOut" });
    return controls.stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => rounded.on("change", setDisplay), [rounded]);

  return <span>{display}</span>;
}
