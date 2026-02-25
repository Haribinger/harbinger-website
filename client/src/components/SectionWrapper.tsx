import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface Props {
  id: string;
  children: ReactNode;
  className?: string;
}

export default function SectionWrapper({ id, children, className }: Props) {
  const { ref, isInView } = useInView(0.08);
  return (
    <section id={id} ref={ref} className={cn("py-24 md:py-32", className)}>
      <div
        className={cn(
          "container transition-all duration-500 ease-out",
          isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
      >
        {children}
      </div>
    </section>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="font-mono text-[11px] tracking-[0.15em] uppercase text-[#00d4ff] mb-4">
      {children}
    </div>
  );
}

export function SectionTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={cn("font-display text-3xl md:text-[40px] font-bold text-white leading-tight tracking-tight", className)}>
      {children}
    </h2>
  );
}

export function SectionDesc({ children }: { children: ReactNode }) {
  return (
    <p className="mt-4 text-[15px] md:text-base leading-relaxed text-[#777] max-w-xl">
      {children}
    </p>
  );
}
