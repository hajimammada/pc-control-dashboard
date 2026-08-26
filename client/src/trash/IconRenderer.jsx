import React from 'react';
import * as Icons from 'lucide-react';

export default function IconRenderer({ name, className = 'w-5 h-5', color }) {
  if (!name) {
    return <Icons.AppWindow className={className} style={{ color }} />;
  }

  // If icon is an emoji or symbol
  if (name.length <= 2 && /\p{Extended_Pictographic}/u.test(name)) {
    return <span className={`inline-flex items-center justify-center ${className}`}>{name}</span>;
  }

  // If icon is a URL or image path
  if (name.startsWith('http://') || name.startsWith('https://') || name.startsWith('data:') || name.startsWith('./')) {
    return <img src={name} alt="icon" className={`object-contain ${className}`} />;
  }

  // Match Lucide Icon
  const LucideIcon = Icons[name] || Icons.AppWindow;
  return <LucideIcon className={className} style={{ color }} />;
}
