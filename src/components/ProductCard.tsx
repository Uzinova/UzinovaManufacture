import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ProductLabel } from '../types/product';

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  mainImageIndex: number;
  categoryPath?: string[];
  labels?: string[];
  allLabels: ProductLabel[];
  onAddToCart: (id: string) => void;
}

export function ProductCard({
  id,
  name,
  description,
  price,
  images,
  mainImageIndex,
  categoryPath,
  labels,
  allLabels,
  onAddToCart
}: ProductCardProps) {
  const navigate = useNavigate();

  return (
    <div 
      className="bg-accent rounded-lg overflow-hidden hover:shadow-[0_0_30px_rgba(251,146,60,0.2)] transition-all duration-300 cursor-pointer"
      onClick={() => navigate(`/products/${id}`)}
    >
      <div className="relative aspect-square">
        {images && Array.isArray(images) && images.length > 0 ? (
          <img
            src={images[mainImageIndex >= 0 && mainImageIndex < images.length ? mainImageIndex : 0]}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-accent flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
        {labels && labels.length > 0 && (
          <div className="absolute top-2 right-2 flex flex-wrap gap-1">
            {labels.map(labelId => {
              const label = allLabels.find(l => l.id === labelId);
              if (!label) return null;
              return (
                <span
                  key={label.id}
                  className="px-2 py-1 rounded text-xs"
                  style={{
                    backgroundColor: `${label.color}`,
                    color: '#000000'
                  }}
                >
                  {label.name}
                </span>
              );
            })}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2">{name}</h3>
        <div 
          className="text-gray-400 text-sm mb-2 line-clamp-1"
          dangerouslySetInnerHTML={{ 
            __html: description.replace(/<[^>]*>/g, '').substring(0, 100) + '...'
          }} 
        />
        {categoryPath?.length > 0 && (
          <p className="text-sm text-primary mb-4">
            {categoryPath.join(" > ")}
          </p>
        )}
        <div className="flex items-center justify-between">
          <div>
             <span className="text-primary font-bold ml-2">{Math.round(price )} ₺</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(id);
            }}
            className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-colors flex items-center"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Sepete Ekle
          </button>
        </div>
      </div>
    </div>
  );
}
