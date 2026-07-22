import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const TextField = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function TextField({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full rounded-xl border border-white/[0.07] bg-white/[0.03] px-3.5 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-white/[0.15] focus:bg-white/[0.05]",
          className,
        )}
        {...props}
      />
    );
  },
);

export const TextArea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function TextArea({ className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full resize-none rounded-xl border border-white/[0.07] bg-white/[0.03] px-3.5 py-2.5 text-[14px] leading-relaxed text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-white/[0.15] focus:bg-white/[0.05]",
          className,
        )}
        {...props}
      />
    );
  },
);
