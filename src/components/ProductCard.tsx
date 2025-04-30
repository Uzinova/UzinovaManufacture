import React from 'react';
import { ShoppingCart, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ProductLabel } from '../types/product';

interface ProductCardProps {
  id: string;
  name: string;
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
      className="bg-black/40 backdrop-blur-sm rounded-xl overflow-hidden transition-all duration-300 cursor-pointer h-full flex flex-col border border-orange-500/10 hover:border-orange-500/30 group relative"
      onClick={() => navigate(`/products/${id}`)}
    >
      {/* Favorite Button */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          // Add favorite functionality here
        }}
        className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-sm hover:bg-orange-500/20 transition-colors"
      >
        <Heart className="w-4 h-4 text-white" />
      </button>

      {/* Image Container */}
      <div className="relative w-full pt-[100%] bg-gradient-to-b from-black/20 to-transparent">
        <div className="absolute inset-0 p-3">
          {images && Array.isArray(images) && images.length > 0 ? (
            <div className="relative w-full h-full">
              <img
                src={images[mainImageIndex >= 0 && mainImageIndex < images.length ? mainImageIndex : 0]}
                alt={name}
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          ) : (
            <div className="w-full h-full bg-black/20 flex items-center justify-center text-gray-400 rounded-lg">
              No Image
            </div>
          )}
        </div>

        {/* Labels */}
        {labels && labels.length > 0 && (
          <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
            {labels.map(labelId => {
              const label = allLabels.find(l => l.id === labelId);
              if (!label) return null;
              return (
                <span
                  key={label.id}
                  className="px-2 py-1 rounded-full text-[10px] font-medium backdrop-blur-sm shadow-sm"
                  style={{
                    backgroundColor: `${label.color}99`,
                    color: '#ffffff'
                  }}
                >
                  {label.name}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="font-medium text-sm text-white/90 mb-1 line-clamp-2 min-h-[2.5rem]">
          {name}
        </h3>

        {categoryPath && categoryPath.length > 0 && (
          <div className="flex items-center gap-1 mb-2">
            {categoryPath.map((category, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span className="text-orange-500/50">/</span>}
                <span className="text-[10px] text-orange-500">{category}</span>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Price Section */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-lg font-bold text-orange-500">{Math.round(price)} ₺</span>
            <span className="text-xs line-through text-gray-500">{Math.round(price * 1.2)} ₺</span>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(id);
            }}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Sepete Ekle
          </button>
        </div>
      </div>
    </div>
  );
}
