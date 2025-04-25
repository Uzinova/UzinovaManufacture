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
      className="bg-accent rounded-lg overflow-hidden hover:shadow-[0_0_30px_rgba(251,146,60,0.2)] transition-all duration-300 cursor-pointer h-full flex flex-col"
      onClick={() => navigate(`/products/${id}`)}
    >
      <div className="relative aspect-[1/1] p-2">
        {images && Array.isArray(images) && images.length > 0 ? (
          <img
            src={images[mainImageIndex >= 0 && mainImageIndex < images.length ? mainImageIndex : 0]}
            alt={name}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full bg-accent flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
        {labels && labels.length > 0 && (
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {labels.map(labelId => {
              const label = allLabels.find(l => l.id === labelId);
              if (!label) return null;
              return (
                <span
                  key={label.id}
                  className="px-1.5 py-0.5 rounded-sm text-[10px] font-medium"
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
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="font-medium text-base mb-1 line-clamp-1">{name}</h3>
        <div 
          className="text-gray-400 text-xs mb-2 line-clamp-2 flex-grow min-h-[2.5rem]"
          dangerouslySetInnerHTML={{ 
            __html: description ? description.replace(/<[^>]*>/g, '').substring(0, 100) + '...' : 'Ürün açıklaması bulunmamaktadır.'
          }} 
        />
        {categoryPath && categoryPath.length > 0 && (
          <p className="text-xs text-primary/80 mb-2">
            {categoryPath.join(" > ")}
          </p>
        )}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/10">
          <div>
             <span className="text-primary font-bold text-sm">{Math.round(price)} ₺</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(id);
            }}
            className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs hover:bg-primary/90 transition-colors flex items-center"
          >
            <ShoppingCart className="h-3 w-3 mr-1" />
            Sepete Ekle
          </button>
        </div>
      </div>
    </div>
  );
}
