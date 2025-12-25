import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: "default" | "destructive" | "outline" | "secondary";
    count?: number;
}

export function Badge({
    className,
    variant = "default",
    count,
    children,
    ...props
}: BadgeProps) {
    const variants = {
        default: "bg-red-600 text-white",
        destructive: "bg-red-600 text-white",
        outline: "border border-neutral-300 bg-white text-neutral-900",
        secondary: "bg-neutral-200 text-neutral-900"
    };

    const content = count !== undefined ? count : children;

    return (
        <span
            className={cn(
                "inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold",
                variants[variant],
                className
            )}
            {...props}
        >
            {content}
        </span>
    );
}
