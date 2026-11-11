import type { ReactNode } from "react";
import { Reveal } from "../Reveal";

export function SectionHead({
  kicker,
  title,
  children,
  center = false,
}: {
  kicker: string;
  title: ReactNode;
  children?: ReactNode;
  center?: boolean;
}) {
  return (
    <div className={`max-w-[40rem] ${center ? "mx-auto text-center" : ""}`}>
      <Reveal>
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-accent">{kicker}</p>
      </Reveal>
      <Reveal delay={80}>
        <h2 className="mt-4 text-balance text-[clamp(2rem,5vw,4.2rem)] font-extralight leading-[1.02] tracking-[-0.04em] text-white">
          {title}
        </h2>
      </Reveal>
      {children && (
        <Reveal delay={160}>
          <p className="mt-5 text-pretty text-[15px] leading-relaxed text-white/55 md:text-[17px]">{children}</p>
        </Reveal>
      )}
    </div>
  );
}
