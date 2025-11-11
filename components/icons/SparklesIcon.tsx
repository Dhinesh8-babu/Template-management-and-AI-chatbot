
import React from 'react';

export const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9.93 2.55a2 2 0 0 0-1.86 0L6.5 4l-1.58.55a2 2 0 0 0-1.07 1.07L3.45 7.5 2 9.07a2 2 0 0 0 0 1.86L3.45 12.5l.4 1.88a2 2 0 0 0 1.07 1.07L6.5 16l1.58.55a2 2 0 0 0 1.86 0L11.5 16l1.58-.55a2 2 0 0 0 1.07-1.07L14.55 12.5 16 10.93a2 2 0 0 0 0-1.86L14.55 7.5l-.4-1.88a2 2 0 0 0-1.07-1.07L11.5 4z" />
    <path d="M18 6 16 2" />
    <path d="m22 14-2-2" />
    <path d="M6 18l-2 4" />
    <path d="m14 22 2-2" />
  </svg>
);
