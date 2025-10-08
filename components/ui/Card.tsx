import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export default function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={`bg-card rounded-lg shadow-sm border border-border p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

