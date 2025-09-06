"use client";

import React from 'react';

export function AppIcon({ size = 48, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Purple background circle */}
      <circle cx="24" cy="24" r="24" fill="#8b5cf6" />
      
      {/* Abstract barbell icon in white */}
      <rect x="10" y="22" width="28" height="4" rx="2" fill="white" />
      <rect x="15" y="18" width="4" height="12" rx="2" fill="white" />
      <rect x="29" y="18" width="4" height="12" rx="2" fill="white" />
      
      {/* Small decorative elements */}
      <circle cx="12" cy="20" r="2" fill="white" opacity="0.7" />
      <circle cx="36" cy="28" r="2" fill="white" opacity="0.7" />
    </svg>
  );
}