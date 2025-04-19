import React from 'react';
import { Tag } from 'lucide-react';

interface DiscountBadgeProps {
  discountRate: number;
  className?: string;
}

export function DiscountBadge({ discountRate, className = '' }: DiscountBadgeProps) {
  return (
    <div className={`absolute top-2 right-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm flex items-center ${className}`}>
      <Tag className="w-4 h-4 mr-1" />
      %{Math.round(discountRate)} İndirim
    </div>
  );
}
