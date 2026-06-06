"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    borderColorHoverClass?: string;
    iconBgColorClass?: string;
    iconColorClass?: string;
}

export function FeatureCard({
    title,
    description,
    icon: Icon,
    borderColorHoverClass = "hover:border-emerald-500/30",
    iconBgColorClass = "bg-emerald-500/10",
    iconColorClass = "text-emerald-600 dark:text-emerald-400"
}: FeatureCardProps) {
    return (
        <div className={cn(
            "group rounded-2xl border border-border/50 bg-card p-6 shadow-sm hover:shadow-md transition-all duration-300",
            borderColorHoverClass
        )}>
            <div className={cn(
                "size-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300",
                iconBgColorClass,
                iconColorClass
            )}>
                <Icon className="size-6" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
            </p>
        </div>
    );
}
