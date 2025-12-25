import { forwardRef, InputHTMLAttributes } from "react";
import { clsx } from "clsx";

type CheckboxProps = InputHTMLAttributes<HTMLInputElement>;

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => (
    <input
      type="checkbox"
      ref={ref}
      className={clsx(
        "h-5 w-5 rounded border border-black/30 text-black accent-black",
        className
      )}
      {...props}
    />
  )
);

Checkbox.displayName = "Checkbox";
