// src/ProductList.js
import React, { useState, useEffect } from 'react';
import Product from './Product';
import './ProductList.css'; // optional, for styling
import { fetchProducts } from '../listdata';

const ProductList = ({ selectedCategory, selectedSubcategory }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const getProducts = async () => {
      const productsData = await fetchProducts();
      setProducts(productsData);
    };

    getProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    if (selectedCategory === 'Hepsi' || !selectedCategory) {
      return true;
    } else if (selectedCategory && selectedSubcategory) {
      return product.category === selectedCategory && product.subcategory === selectedSubcategory;
    } else if (selectedCategory) {
      return product.category === selectedCategory;
    } else {
      return true;
    }
  });

  return (
    <div className="product-list">
      {filteredProducts.map((product) => (
        <Product key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductList;
