import { ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";

type Variant = "primary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  fullWidth?: boolean;
};

export const Button = ({
  className,
  variant = "primary",
  fullWidth,
  ...props
}: ButtonProps) => {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";
  const variants: Record<Variant, string> = {
    primary:
      "bg-black text-white hover:bg-neutral-900 focus-visible:outline-black disabled:bg-neutral-400",
    ghost:
      "border border-black/10 text-black hover:bg-black/5 focus-visible:outline-black disabled:text-neutral-400"
  };

  return (
    <button
      className={clsx(base, variants[variant], fullWidth && "w-full", className)}
      {...props}
    />
  );
};
