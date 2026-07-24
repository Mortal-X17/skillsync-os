import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Global autofill suppression props applied to every reusable input.
 *
 * SkillSync has no auth surface (no email/password fields), so Android's
 * Autofill Framework, Password Managers and Credential Manager should
 * never activate anywhere in the app.
 *
 * These attributes are the widest compatible set:
 *  - autoComplete="off" is the standard HTML opt-out (respected by Chrome / WebView)
 *  - autoCorrect / autoCapitalize / spellCheck give plain-text keyboard behavior
 *  - data-form-type="other", data-lpignore, data-1p-ignore, data-bwignore
 *    silence LastPass / 1Password / Bitwarden / other browser extensions
 */
const NO_AUTOFILL_PROPS = {
  autoComplete: "off",
  autoCorrect: "off",
  autoCapitalize: "off",
  spellCheck: false,
  "data-form-type": "other",
  "data-lpignore": "true",
  "data-1p-ignore": "",
  "data-bwignore": "true",
} as const;

export const TextField = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function TextField({ className, type, ...props }, ref) {
    return (
      <input
        ref={ref}
        type={type ?? "text"}
        {...NO_AUTOFILL_PROPS}
        {...props}
        className={cn(
          "w-full rounded-xl border border-white/[0.07] bg-white/[0.03] px-3.5 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-white/[0.15] focus:bg-white/[0.05]",
          className,
        )}
      />
    );
  },
);

export const TextArea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function TextArea({ className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        {...NO_AUTOFILL_PROPS}
        {...props}
        className={cn(
          "w-full resize-none rounded-xl border border-white/[0.07] bg-white/[0.03] px-3.5 py-2.5 text-[14px] leading-relaxed text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-white/[0.15] focus:bg-white/[0.05]",
          className,
        )}
      />
    );
  },
);
