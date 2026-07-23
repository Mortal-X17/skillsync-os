import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col">
      <main className="flex-1 pb-32 pt-[max(env(safe-area-inset-top),20px)]">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

export function AppFooter() {
  return (
    <footer className="mt-10 px-5 pb-4 text-center">
      <div
        className="text-[16px] leading-tight text-foreground/85"
        style={{ fontFamily: "'Caveat', 'Brush Script MT', cursive" }}
      >
        Created with <span className="text-[#f472b6]">♥</span> by Piyush
      </div>
      <div
        className="mt-0.5 text-[13px] text-muted-foreground/80"
        style={{ fontFamily: "'Caveat', 'Brush Script MT', cursive" }}
      >
        You gonna thank me for SkillSync
      </div>
    </footer>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  right,
  sticky = false,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  sticky?: boolean;
}) {
  return (
    <header
      className={cn(
        "mb-6 flex items-start justify-between gap-4 px-5",
        sticky &&
          "sticky top-0 z-50 bg-background/95 py-5 backdrop-blur-xl transition-colors",
      )}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <div className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {eyebrow}
          </div>
        ) : null}
        <h1 className="text-balance text-[28px] font-semibold leading-tight tracking-[-0.02em] text-foreground">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1.5 text-[14px] text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {right}
    </header>
  );
}
