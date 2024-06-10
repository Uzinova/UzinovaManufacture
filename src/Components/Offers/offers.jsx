import React, { useState, useEffect } from 'react';
import ProductList from './ProductList';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap
 
import './offers.css'; // Import your custom CSS
import { fetchCategories } from '../listdata';

function Offers() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedSubsubcategory, setSelectedSubsubcategory] = useState('');

  useEffect(() => {
    const loadCategories = async () => {
      const categoriesData = await fetchCategories();
      setCategories([{ id: 'hepsi', name: 'Hepsi' }, ...categoriesData]);
    };

    loadCategories();
  }, []);

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName === selectedCategory ? '' : categoryName);
    setSelectedSubcategory('');
    setSelectedSubsubcategory('');
  };

  const handleSubcategoryClick = (subcategoryName) => {
    setSelectedSubcategory(subcategoryName === selectedSubcategory ? '' : subcategoryName);
    setSelectedSubsubcategory('');
  };

  const handleSubsubcategoryClick = (subsubcategoryName) => {
    setSelectedSubsubcategory(subsubcategoryName);
  };

  const getSubcategories = (categoryName) => {
    if (categoryName === 'Hepsi') return [];
    const category = categories.find(cat => cat.name === categoryName);
    return category ? Object.keys(category.subcategories) : [];
  };

  const getSubsubcategories = (categoryName, subcategoryName) => {
    if (categoryName === 'Hepsi' || !subcategoryName) return [];
    const category = categories.find(cat => cat.name === categoryName);
    return category ? Object.keys(category.subcategories[subcategoryName] || {}) : [];
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
                    <i className={`bi ${selectedCategory === category.name ? 'bi-chevron-down' : 'bi-chevron-right'} ms-auto`}></i>
                  </button>
                </h2>
                <div
                  id={`collapse-${category.id}`}
                  className={`accordion-collapse collapse ${selectedCategory === category.name ? 'show' : ''}`}
                  aria-labelledby={`heading-${category.id}`}
                  data-bs-parent="#categoryAccordion"
                >
                  <div className="accordion-body">
                    <div className="accordion" id={`subcategoryAccordion-${category.id}`}>
                      {getSubcategories(category.name).map((subcategory) => (
                        <div className="accordion-item" key={subcategory}>
                          <h2 className="accordion-header" id={`heading-${subcategory}`}>
                            <button
                              className="accordion-button"
                              type="button"
                              data-bs-toggle="collapse"
                              data-bs-target={`#collapse-${subcategory}`}
                              aria-expanded={selectedSubcategory === subcategory}
                              aria-controls={`collapse-${subcategory}`}
                              onClick={() => handleSubcategoryClick(subcategory)}
                            >
                              {subcategory}
                              <i className={`bi ${selectedSubcategory === subcategory ? 'bi-chevron-down' : 'bi-chevron-right'} ms-auto`}></i>
                            </button>
                          </h2>
                          <div
                            id={`collapse-${subcategory}`}
                            className={`accordion-collapse collapse ${selectedSubcategory === subcategory ? 'show' : ''}`}
                            aria-labelledby={`heading-${subcategory}`}
                            data-bs-parent={`#subcategoryAccordion-${category.id}`}
                          >
                            <div className="accordion-body">
                              <ul className="list-group">
                                {getSubsubcategories(category.name, subcategory).map((subsubcategory) => (
                                  <li
                                    key={subsubcategory}
                                    className={`list-group-item ${selectedSubsubcategory === subsubcategory ? 'active' : ''}`}
                                    onClick={() => handleSubsubcategoryClick(subsubcategory)}
                                  >
                                    {subsubcategory}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="col-md-9 product-list-container">
          <ProductList selectedCategory={selectedCategory} selectedSubcategory={selectedSubcategory} selectedSubsubcategory={selectedSubsubcategory} />
        </div>
      </div>
    </div>
  );
}

export default Offers;
