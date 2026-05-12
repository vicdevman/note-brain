"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useRef } from "react";

export type PopupAction = {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  destructive?: boolean;
};

type MiniPopupProps = {
  open: boolean;
  onClose: () => void;
  actions: PopupAction[];
  className?: string;
  align?: "left" | "right";
};

export default function MiniPopup({ 
  open, 
  onClose, 
  actions, 
  className = "",
  align = "right" 
}: MiniPopupProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      const el = containerRef.current;
      if (!el) return;
      if (el.contains(e.target as Node)) return;
      onClose();
    }

    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className={`absolute z-10 w-44 rounded-md border border-[var(--nb-border-strong)] bg-[var(--nb-surface)] shadow-lg overflow-hidden ${align === "right" ? "right-2" : "left-2"} ${className}`}
        >
          {actions.map((action, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                action.onClick();
                onClose();
              }}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-[var(--nb-surface-muted)] inline-flex items-center gap-2 ${
                action.destructive ? "text-red-500" : "text-[var(--nb-text)]"
              }`}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
