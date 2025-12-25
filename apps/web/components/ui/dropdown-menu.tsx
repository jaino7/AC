"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DropdownMenuProps {
    trigger: React.ReactNode;
    children: React.ReactNode;
    align?: "start" | "end";
}

export function DropdownMenu({ trigger, children, align = "end" }: DropdownMenuProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative" ref={dropdownRef}>
            <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
                {trigger}
            </div>
            {isOpen && (
                <div
                    className={cn(
                        "absolute top-full z-50 mt-2 min-w-[200px] rounded-lg border border-neutral-200 bg-white py-1 shadow-lg",
                        align === "end" ? "right-0" : "left-0"
                    )}
                >
                    {children}
                </div>
            )}
        </div>
    );
}

interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function DropdownMenuItem({ children, className, ...props }: DropdownMenuItemProps) {
    return (
        <div
            className={cn(
                "cursor-pointer px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

interface DropdownMenuSeparatorProps extends React.HTMLAttributes<HTMLDivElement> { }

export function DropdownMenuSeparator({ className, ...props }: DropdownMenuSeparatorProps) {
    return <div className={cn("my-1 h-px bg-neutral-200", className)} {...props} />;
}
