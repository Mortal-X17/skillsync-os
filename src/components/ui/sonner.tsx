import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      position="top-center"
      offset={16}
      toastOptions={{
        classNames: {
          toast:
            "group toast glass group-[.toaster]:rounded-[16px] group-[.toaster]:bg-surface/90 group-[.toaster]:text-foreground group-[.toaster]:shadow-[var(--shadow-float)]",
          title: "group-[.toast]:text-[14px] group-[.toast]:font-medium",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-[13px]",
          actionButton:
            "group-[.toast]:gradient-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-[10px]",
          cancelButton:
            "group-[.toast]:bg-white/[0.06] group-[.toast]:text-muted-foreground group-[.toast]:rounded-[10px]",
          success: "group-[.toaster]:text-success",
          error: "group-[.toaster]:text-danger",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
