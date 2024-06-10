// src/Offers.js
import React, { useState, useEffect } from 'react';
import ProductList from './ProductList';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap
import './offers.css'; // Import your custom CSS
import { fetchCategories } from '../listdata';

function Offers() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');

  useEffect(() => {
    const loadCategories = async () => {
      const categoriesData = await fetchCategories();
      setCategories([{ id: 'hepsi', name: 'Hepsi' }, ...categoriesData]);
    };

    loadCategories();
  }, []);

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName === selectedCategory ? '' : categoryName);
    setSelectedSubcategory(''); // Reset subcategory when category changes
  };

  const handleSubcategoryClick = (subcategoryName) => {
    setSelectedSubcategory(subcategoryName);
  };

  const getSubcategories = (categoryName) => {
    if (categoryName === 'Hepsi') return [];
    const category = categories.find(cat => cat.name === categoryName);
    return category ? Object.keys(category.subcategories) : [];
  };

  return (
    <div className="offers-container container">
      <div className="row">
        <div className="col-md-3 sidebar">
          <div className="accordion" id="categoryAccordion">
            {categories.map((category) => (
              <div className="accordion-item" key={category.id}>
                <h2 className="accordion-header" id={`heading-${category.id}`}>
                  <button
                    className="accordion-button"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#collapse-${category.id}`}
                    aria-expanded={selectedCategory === category.name}
                    aria-controls={`collapse-${category.id}`}
                    onClick={() => handleCategoryClick(category.name)}
                  >
                    {category.name}
                  </button>
                </h2>
                <div
                  id={`collapse-${category.id}`}
                  className={`accordion-collapse collapse ${selectedCategory === category.name ? 'show' : ''}`}
                  aria-labelledby={`heading-${category.id}`}
                  data-bs-parent="#categoryAccordion"
                >
                  <div className="accordion-body">
                    <ul className="list-group">
                      {getSubcategories(category.name).map((subcategory) => (
                        <li
                          key={subcategory}
                          className={`list-group-item ${selectedSubcategory === subcategory ? 'active' : ''}`}
                          onClick={() => handleSubcategoryClick(subcategory)}
                        >
                          {subcategory}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
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
}

export default Offers;
