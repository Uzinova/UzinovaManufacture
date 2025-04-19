import React from 'react';
import { calculateDiscountedPrice, formatPrice, isDiscountActive } from '../lib/utils';

interface PriceDisplayProps {
  price: number;
  discountRate?: number;
  discountStart?: string;
  discountEnd?: string;
  className?: string;
}

export function PriceDisplay({ 
  price,
  discountRate,
  discountStart,
  discountEnd,
  className = ''
}: PriceDisplayProps) {
  const hasActiveDiscount = discountRate && isDiscountActive(discountStart, discountEnd);
  const discountedPrice = hasActiveDiscount ? calculateDiscountedPrice(price, discountRate) : price;

  return (
    <div className={`flex items-baseline gap-2 ${className}`}>
      {hasActiveDiscount && (
        <span className="text-gray-400 line-through text-sm">
          {formatPrice(price)}
        </span>
      )}
      <span className={`font-bold ${hasActiveDiscount ? 'text-primary' : ''}`}>
        {formatPrice(discountedPrice)}
      </span>
    </div>
  );
}
