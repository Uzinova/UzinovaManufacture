import React from 'react';
import type { ProductLabel } from '../types/product';

interface ProductLabelsProps {
  labels: ProductLabel[];
  className?: string;
}

export function ProductLabels({ labels, className = '' }: ProductLabelsProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {labels.map(label => (
        <span
          key={label.id}
          className="px-2 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: `${label.color}20`,
            color: label.color,
          }}
        >
          {label.name}
        </span>
      ))}
    </div>
  );
}
