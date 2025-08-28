"use client";

import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import React, { useState } from "react";

// Select components
export const Select = ({
  children,
  value,
  onValueChange,
  ...props
}: {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || "");

  const handleSelect = (newValue: string) => {
    setSelectedValue(newValue);
    onValueChange?.(newValue);
    setIsOpen(false);
  };

  return (
    <div className="relative" {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            isOpen,
            setIsOpen,
            selectedValue,
            onSelect: handleSelect,
          } as React.JSX.IntrinsicAttributes);
        }
        return child;
      })}
    </div>
  );
};

export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    isOpen?: boolean;
    setIsOpen?: (open: boolean) => void;
  }
>(({ className, children, isOpen, setIsOpen, ...props }, ref) => {
  // Filter out custom props to avoid passing them to DOM elements
  const domProps = props;

  return (
    <button
      ref={ref}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-gray-900",
        className
      )}
      onClick={() => setIsOpen?.(!isOpen)}
      {...domProps}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
});
SelectTrigger.displayName = "SelectTrigger";

export const SelectContent = ({
  className,
  children,
  isOpen,
  onSelect,
  ...props
}: {
  className?: string;
  children: React.ReactNode;
  isOpen?: boolean;
  onSelect?: (value: string) => void;
}) => {
  if (!isOpen) return null;

  // Filter out custom props to avoid passing them to DOM elements
  const domProps = props;

  return (
    <div
      className={cn(
        "absolute z-50 min-w-[8rem] max-h-60 overflow-y-auto rounded-md border bg-white text-gray-900 shadow-md animate-in fade-in-0 zoom-in-95 top-full mt-1",
        className
      )}
      {...domProps}
    >
      <div className="p-1">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              onSelect,
            } as React.JSX.IntrinsicAttributes);
          }
          return child;
        })}
      </div>
    </div>
  );
};

export const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value: string;
    onSelect?: (value: string) => void;
  }
>(({ className, children, value, onSelect, ...props }, ref) => {
  // Filter out custom props to avoid passing them to DOM elements
  const domProps = props;

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-blue-50 hover:text-blue-900 focus:bg-blue-50 focus:text-blue-900 text-gray-900",
        className
      )}
      onClick={() => onSelect?.(value)}
      {...domProps}
    >
      {children}
    </div>
  );
});
SelectItem.displayName = "SelectItem";

export const SelectValue = ({
  placeholder,
  children,
  selectedValue,
}: {
  placeholder?: string;
  children?: React.ReactNode;
  selectedValue?: string;
}) => {
  return <span>{children || selectedValue || placeholder}</span>;
};
