import React, { useState, useEffect } from 'react';
import { fetchProducts, addProduct, deleteProduct, updateProduct, fetchCategories, addCategory, addSubcategory } from '../listdata';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './ProductsTab.css';

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

  const handleDescriptionChange = (value) => {
    setNewProduct({
      ...newProduct,
      description: value,
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
    await addSubcategory(selectedCategory, newSubcategory);
    setNewSubcategory('');
    const categoriesData = await fetchCategories();
    setCategories(categoriesData);
  };

  const handleAddSubsubcategory = async () => {
    await addSubcategory(selectedCategory, newSubsubcategory, selectedSubcategory);
    setNewSubsubcategory('');
    const categoriesData = await fetchCategories();
    setCategories(categoriesData);
  };

  const toggleExpand = (e) => {
    const listItem = e.currentTarget.parentElement;
    const nestedList = listItem.querySelector('ul');
    if (nestedList) {
      nestedList.classList.toggle('collapsed');
    }
  };

  const renderCategoryTree = (category) => (
    <li key={category.id}>
      <div onClick={toggleExpand} className="tree-node-label">
        {category.name}
      </div>
      {Object.keys(category.subcategories).length > 0 && (
        <ul className="tree-node">
          {Object.keys(category.subcategories).map(subcategoryName => (
            <li key={subcategoryName}>
              <div onClick={toggleExpand} className="tree-node-label">
                {subcategoryName}
              </div>
              {Object.keys(category.subcategories[subcategoryName]).length > 0 && (
                <ul className="tree-node">
                  {Object.keys(category.subcategories[subcategoryName]).map(subsubcategoryName => (
                    <li key={subsubcategoryName}>
                      <div className="tree-node-label">
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
      <h3>{editingProduct ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}</h3>
      <div className="product-form">
        <input type="text" name="name" value={newProduct.name} onChange={handleChange} placeholder="İsim" />
        <ReactQuill value={newProduct.description} onChange={handleDescriptionChange} placeholder="Açıklama" />
        <input type="number" name="price" value={newProduct.price} onChange={handleChange} placeholder="Fiyat" />
        <select name="category" value={newProduct.category} onChange={handleChange}>
          <option value="">Kategori Seçin</option>
          {categories.map(category => (
            <option key={category.id} value={category.name}>{category.name}</option>
          ))}
        </select>
        <select name="subcategory" value={newProduct.subcategory} onChange={handleChange}>
          <option value="">Alt Kategori Seçin</option>
          {categories.find(cat => cat.name === newProduct.category)?.subcategories &&
            Object.keys(categories.find(cat => cat.name === newProduct.category).subcategories).map(subcat => (
              <option key={subcat} value={subcat}>{subcat}</option>
          ))}
        </select>
        <select name="subsubcategory" value={newProduct.subsubcategory} onChange={handleChange}>
          <option value="">Alt Alt Kategori Seçin</option>
          {categories.find(cat => cat.name === newProduct.category)?.subcategories[newProduct.subcategory] &&
            Object.keys(categories.find(cat => cat.name === newProduct.category).subcategories[newProduct.subcategory]).map(subsubcat => (
              <option key={subsubcat} value={subsubcat}>{subsubcat}</option>
          ))}
        </select>
        <input type="text" name="image" value={newProduct.image} onChange={handleChange} placeholder="Görsel URL'si" />
        <label>
          <input type="checkbox" name="onSale" checked={newProduct.onSale} onChange={handleChange} />
          Fırsat Ürün
        </label>
        <button onClick={handleAddProduct}>{editingProduct ? 'Ürünü Güncelle' : 'Ürün Ekle'}</button>
      </div>

      <h3>Kategoriler</h3>
      <div className="category-form">
        <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Yeni Kategori" />
        <button onClick={handleAddCategory}>Kategori Ekle</button>
      </div>

      <h3>Alt Kategoriler</h3>
      <div className="subcategory-form">
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          <option value="">Kategori Seçin</option>
          {categories.map(category => (
            <option key={category.id} value={category.name}>{category.name}</option>
          ))}
        </select>
        <input type="text" value={newSubcategory} onChange={(e) => setNewSubcategory(e.target.value)} placeholder="Yeni Alt Kategori" />
        <button onClick={() => handleAddSubcategory()}>Alt Kategori Ekle</button>
      </div>

      <h3>Alt Alt Kategoriler</h3>
      <div className="subsubcategory-form">
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          <option value="">Kategori Seçin</option>
          {categories.map(category => (
            <option key={category.id} value={category.name}>{category.name}</option>
          ))}
        </select>
        <select value={selectedSubcategory} onChange={(e) => setSelectedSubcategory(e.target.value)}>
          <option value="">Alt Kategori Seçin</option>
          {categories.find(cat => cat.name === selectedCategory)?.subcategories &&
            Object.keys(categories.find(cat => cat.name === selectedCategory).subcategories).map(subcat => (
              <option key={subcat} value={subcat}>{subcat}</option>
          ))}
        </select>
        <input type="text" value={newSubsubcategory} onChange={(e) => setNewSubsubcategory(e.target.value)} placeholder="Yeni Alt Alt Kategori" />
        <button onClick={() => handleAddSubsubcategory()}>Alt Alt Kategori Ekle</button>
      </div>

      <h3>Kategori Ağacı</h3>
      <ul>
        {categories.map(category => renderCategoryTree(category))}
      </ul>

      <h3>Ürün Listesi</h3>
      <ul>
        {products.map(product => (
          <li key={product.id}>
            <div className="product-info">
              <img src={product.image} alt={product.name} />
              <div>
                <h4>{product.name}</h4>
                <div dangerouslySetInnerHTML={{ __html: product.description }}></div>
                <p>${product.price}</p>
                <p>{product.category} - {product.subcategory} - {product.subsubcategory}</p>
                <p>{product.onSale ? 'Satışta' : 'Satışta Değil'}</p>
              </div>
            </div>
            <div className="product-actions">
              <button onClick={() => handleEditProduct(product)}>Düzenle</button>
              <button onClick={() => handleDeleteProduct(product.id)}>Sil</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductsTab;
