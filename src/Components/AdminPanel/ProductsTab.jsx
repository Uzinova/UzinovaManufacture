import React, { useState, useEffect } from 'react';
import { fetchProducts, addProduct, deleteProduct, updateProduct, fetchCategories, addCategory, addSubcategory } from '../listdata';
import './ProductsTab.css'; // Adjust the path to your CSS file

const ProductsTab = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [newSubcategory, setNewSubcategory] = useState('');
  const [newSubsubcategory, setNewSubsubcategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    subcategory: '',
    subsubcategory: '',
    image: '',
    onSale: false,
  });
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    const loadProductsAndCategories = async () => {
      const productsData = await fetchProducts();
      const categoriesData = await fetchCategories();
      setProducts(productsData);
      setCategories(categoriesData);
    };

    loadProductsAndCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewProduct({
      ...newProduct,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleAddProduct = async () => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, newProduct);
    } else {
      await addProduct(newProduct);
    }
    setNewProduct({ name: '', description: '', price: '', category: '', subcategory: '', subsubcategory: '', image: '', onSale: false });
    setEditingProduct(null);
    const productsData = await fetchProducts();
    setProducts(productsData);
  };

  const handleDeleteProduct = async (productId) => {
    await deleteProduct(productId);
    const productsData = await fetchProducts();
    setProducts(productsData);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setNewProduct(product);
  };

  const handleAddCategory = async () => {
    await addCategory(newCategory);
    setNewCategory('');
    const categoriesData = await fetchCategories();
    setCategories(categoriesData);
  };

  const handleAddSubcategory = async () => {
    if (newSubsubcategory) {
      await addSubcategory(selectedCategory, selectedSubcategory, newSubsubcategory);
      setNewSubsubcategory('');
    } else {
      await addSubcategory(selectedCategory, newSubcategory);
      setNewSubcategory('');
    }
    const categoriesData = await fetchCategories();
    setCategories(categoriesData);
  };

  const renderCategoryTree = (category) => (
    <li key={category.id}>
      <div>
        {category.name}
      </div>
      {Object.keys(category.subcategories).length > 0 && (
        <ul className="tree-node">
          {Object.keys(category.subcategories).map(subcategoryName => (
            <li key={subcategoryName}>
              <div>
                {subcategoryName}
              </div>
              {Object.keys(category.subcategories[subcategoryName]).length > 0 && (
                <ul className="tree-node">
                  {Object.keys(category.subcategories[subcategoryName]).map(subsubcategoryName => (
                    <li key={subsubcategoryName}>
                      <div>
                        {subsubcategoryName}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </li>
  );

  return (
    <div className="products-tab">
      <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
      <div className="product-form">
        <input type="text" name="name" value={newProduct.name} onChange={handleChange} placeholder="Name" />
        <input type="text" name="description" value={newProduct.description} onChange={handleChange} placeholder="Description" />
        <input type="number" name="price" value={newProduct.price} onChange={handleChange} placeholder="Price" />
        
        <select name="category" value={newProduct.category} onChange={handleChange}>
          <option value="">Select Category</option>
          {categories.map(category => (
            <option key={category.id} value={category.name}>{category.name}</option>
          ))}
        </select>
        
        <select name="subcategory" value={newProduct.subcategory} onChange={handleChange}>
          <option value="">Select Subcategory</option>
          {categories.find(cat => cat.name === newProduct.category)?.subcategories &&
            Object.keys(categories.find(cat => cat.name === newProduct.category).subcategories).map(subcat => (
              <option key={subcat} value={subcat}>{subcat}</option>
          ))}
        </select>

        <select name="subsubcategory" value={newProduct.subsubcategory} onChange={handleChange}>
          <option value="">Select Sub-subcategory</option>
          {categories.find(cat => cat.name === newProduct.category)?.subcategories[newProduct.subcategory] &&
            Object.keys(categories.find(cat => cat.name === newProduct.category).subcategories[newProduct.subcategory]).map(subsubcat => (
              <option key={subsubcat} value={subsubcat}>{subsubcat}</option>
          ))}
        </select>
        
        <input type="text" name="image" value={newProduct.image} onChange={handleChange} placeholder="Image URL" />
        <label>
          <input type="checkbox" name="onSale" checked={newProduct.onSale} onChange={handleChange} />
          On Sale
        </label>
        <button onClick={handleAddProduct}>{editingProduct ? 'Update Product' : 'Add Product'}</button>
      </div>
      
      <h3>Categories</h3>
      <div className="category-form">
        <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="New Category" />
        <button onClick={handleAddCategory}>Add Category</button>
      </div>
      
      <h3>Subcategories</h3>
      <div className="subcategory-form">
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          <option value="">Select Category</option>
          {categories.map(category => (
            <option key={category.id} value={category.name}>{category.name}</option>
          ))}
        </select>
        <input type="text" value={newSubcategory} onChange={(e) => setNewSubcategory(e.target.value)} placeholder="New Subcategory" />
        <button onClick={() => handleAddSubcategory()}>Add Subcategory</button>
      </div>

      <h3>Sub-subcategories</h3>
      <div className="subcategory-form">
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          <option value="">Select Category</option>
          {categories.map(category => (
            <option key={category.id} value={category.name}>{category.name}</option>
          ))}
        </select>
        <select value={selectedSubcategory} onChange={(e) => setSelectedSubcategory(e.target.value)}>
          <option value="">Select Subcategory</option>
          {categories.find(cat => cat.name === selectedCategory)?.subcategories &&
            Object.keys(categories.find(cat => cat.name === selectedCategory).subcategories).map(subcat => (
              <option key={subcat} value={subcat}>{subcat}</option>
          ))}
        </select>
        <input type="text" value={newSubsubcategory} onChange={(e) => setNewSubsubcategory(e.target.value)} placeholder="New Sub-subcategory" />
        <button onClick={() => handleAddSubcategory()}>Add Sub-subcategory</button>
      </div>
      
      <h3>Categories Tree</h3>
      <ul>
        {categories.map(category => renderCategoryTree(category))}
      </ul>

      <h3>Products List</h3>
      <ul>
        {products.map(product => (
          <li key={product.id}>
            <div>
              <img src={product.image} alt={product.name} />
              <div>
                <h4>{product.name}</h4>
                <p>{product.description}</p>
                <p>${product.price}</p>
                <p>{product.category} - {product.subcategory} - {product.subsubcategory}</p>
                <p>{product.onSale ? 'On Sale' : 'Not On Sale'}</p>
              </div>
            </div>
            <button onClick={() => handleEditProduct(product)}>Edit</button>
            <button onClick={() => handleDeleteProduct(product.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductsTab;
