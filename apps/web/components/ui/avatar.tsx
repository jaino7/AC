import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    src?: string;
    alt?: string;
    fallback?: string;
}

export function Avatar({ src, alt, fallback, className, ...props }: AvatarProps) {
    const [imageError, setImageError] = React.useState(false);

    return (
        <div
            className={cn(
                "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
                className
            )}
            {...props}
        >
            {src && !imageError ? (
                <img
                    src={src}
                    alt={alt || "Avatar"}
                    className="aspect-square h-full w-full object-cover"
                    onError={() => setImageError(true)}
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center bg-neutral-200 text-sm font-medium text-neutral-700">
                    {fallback || alt?.charAt(0).toUpperCase() || "?"}
                </div>
            )}
        </div>
    );
}
