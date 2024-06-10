// src/CategoryPage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProductList from './ProductList';
import { fetchCategories } from '../listdata';
import 'bootstrap/dist/css/bootstrap.min.css';
import './CategoryPage.css';

const CategoryPage = () => {
  const { categoryName } = useParams();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(categoryName);
  const [selectedSubcategory, setSelectedSubcategory] = useState('');

  useEffect(() => {
    const loadCategories = async () => {
      const categoriesData = await fetchCategories();
      setCategories([{ id: 'hepsi', name: 'Hepsi' }, ...categoriesData]);
    };

    loadCategories();
  }, []);

  const getSubcategories = (categoryName) => {
    if (categoryName === 'Hepsi') return [];
    const category = categories.find(cat => cat.name === categoryName);
    return category ? Object.keys(category.subcategories) : [];
  };

  return (
    <div className="category-page container">
      {/* Category Banner */}
      <div className="category-banner">
        <h1 className="category-title">{categoryName}</h1>
      </div>

      <div className="row">
        <div className="col-md-3 sidebar">
          <div className="accordion" id="subcategoryAccordion">
            {getSubcategories(selectedCategory).map((subcategory) => (
              <div
                key={subcategory}
                className={`list-group-item ${selectedSubcategory === subcategory ? 'active' : ''}`}
                onClick={() => setSelectedSubcategory(subcategory)}
              >
                {subcategory}
              </div>
            ))}
          </div>
        </div>
        <div className="col-md-9 product-list-container">
          <ProductList selectedCategory={selectedCategory} selectedSubcategory={selectedSubcategory} />
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
