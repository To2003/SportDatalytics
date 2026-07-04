import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLDivElement> & {
  hover?: boolean;
};

export default function Card({ hover = false, className = "", ...props }: Props) {
  return (
    <div
      className={`card ${hover ? "card-hover" : ""} p-4 ${className}`}
      {...props}
    />
  );
}
