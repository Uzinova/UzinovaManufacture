import React, { useState, useEffect, useRef } from 'react';
import Modal from 'react-modal';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  fetchProducts,
  addProduct,
  deleteProduct,
  updateProduct,
  fetchCategories,
  addCategory,
  addSubcategory,
  deleteCategory,
  deleteSubcategory,
  deleteSubsubcategory
} from '../listdata';
import './ProductsTab.css';

Modal.setAppElement('#root');

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
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const formRef = useRef(null);

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
    if (name === 'category') {
      setNewProduct({
        ...newProduct,
        category: value,
        subcategory: '',
        subsubcategory: '',
      });
    } else if (name === 'subcategory') {
      setNewProduct({
        ...newProduct,
        subcategory: value,
        subsubcategory: '',
      });
    } else {
      setNewProduct({
        ...newProduct,
        [name]: type === 'checkbox' ? checked : value,
      });
    }
  };

  const handleDescriptionChange = (value) => {
    setNewProduct({
      ...newProduct,
      description: value,
    });
  };

  const handleAddOrUpdateProduct = async () => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, newProduct);
      } else {
        await addProduct(newProduct);
      }
      setNewProduct({
        name: '',
        description: '',
        price: '',
        category: '',
        subcategory: '',
        subsubcategory: '',
        image: '',
        onSale: false
      });
      setEditingProduct(null);
      setModalIsOpen(false);
      const productsData = await fetchProducts();
      setProducts(productsData);
    } catch (error) {
      console.error("Ürün güncellenirken/eklenirken hata oluştu:", error);
    }
  };

  const handleDeleteProduct = async () => {
    if (productToDelete) {
      await deleteProduct(productToDelete.id);
      const productsData = await fetchProducts();
      setProducts(productsData);
      setDeleteModalIsOpen(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      category: product.category || '',
      subcategory: product.subcategory || '',
      subsubcategory: product.subsubcategory || '',
      image: product.image || '',
      onSale: product.onSale || false,
    });
    setModalIsOpen(true);
  };

  const handleAddCategory = async () => {
    await addCategory(newCategory);
    setNewCategory('');
    const categoriesData = await fetchCategories();
    setCategories(categoriesData);
  };

  const handleDeleteCategory = async (categoryId) => {
    await deleteCategory(categoryId);
    const categoriesData = await fetchCategories();
    setCategories(categoriesData);
  };

  const handleDeleteSubcategory = async (categoryId, subcategoryName) => {
    await deleteSubcategory(categoryId, subcategoryName);
    const categoriesData = await fetchCategories();
    setCategories(categoriesData);
  };

  const handleDeleteSubsubcategory = async (categoryId, subcategoryName, subsubcategoryName) => {
    await deleteSubsubcategory(categoryId, subcategoryName, subsubcategoryName);
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

  const ensureArray = (value) => {
    return Array.isArray(value) ? value : [];
  };

  const getSubcategories = (categoryName) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category ? ensureArray(Object.keys(category.subcategories)) : [];
  };

  const getSubsubcategories = (categoryName, subcategoryName) => {
    const subcategories = getSubcategories(categoryName);
    const category = categories.find(cat => cat.name === categoryName);
    const subcategory = category && category.subcategories[subcategoryName];
    return subcategory ? ensureArray(Object.keys(subcategory)) : [];
  };

  return (
    <div className="products-tab">
      <div className="products-list">
        <h2>Ürünler</h2>
        <ul>
          {products.map((product) => (
            <li key={product.id}>
              {product.name}
              <button onClick={() => handleEditProduct(product)}>Düzenle</button>
              <button onClick={() => { setDeleteModalIsOpen(true); setProductToDelete(product); }}>Sil</button>
            </li>
          ))}
        </ul>
        <button onClick={() => setModalIsOpen(true)}>Ürün Ekle</button>
      </div>
      <div className="categories-list">
        <h2>Kategoriler</h2>
        <ul>
          {categories.map((category) => (
            <li key={category.id}>
              {category.name}
              <button onClick={() => handleDeleteCategory(category.id)}>Kategoriyi Sil</button>
              <ul>
                {getSubcategories(category.name).map((sub) => (
                  <li key={sub}>
                    {sub}
                    <button onClick={() => handleDeleteSubcategory(category.id, sub)}>Alt Kategoriyi Sil</button>
                    <ul>
                      {getSubsubcategories(category.name, sub).map((subsub) => (
                        <li key={subsub}>
                          {subsub}
                          <button onClick={() => handleDeleteSubsubcategory(category.id, sub, subsub)}>Alt Alt Kategoriyi Sil</button>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <div className="add-category">
          <input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Yeni Kategori" />
          <button onClick={handleAddCategory}>Kategori Ekle</button>
        </div>
        <div className="add-subcategory">
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="">Kategori Seç</option>
            {categories.map((cat) => (
              <option key={cat.name} value={cat.name}>{cat.name}</option>
            ))}
          </select>
          <input value={newSubcategory} onChange={(e) => setNewSubcategory(e.target.value)} placeholder="Yeni Alt Kategori" />
          <button onClick={handleAddSubcategory}>Alt Kategori Ekle</button>
        </div>
        <div className="add-subsubcategory">
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="">Kategori Seç</option>
            {categories.map((cat) => (
              <option key={cat.name} value={cat.name}>{cat.name}</option>
            ))}
          </select>
          <select value={selectedSubcategory} onChange={(e) => setSelectedSubcategory(e.target.value)}>
            <option value="">Alt Kategori Seç</option>
            {getSubcategories(selectedCategory).map((sub) => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
          <input value={newSubsubcategory} onChange={(e) => setNewSubsubcategory(e.target.value)} placeholder="Yeni Alt Alt Kategori" />
          <button onClick={handleAddSubsubcategory}>Alt Alt Kategori Ekle</button>
        </div>
      </div>
      <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)}>
        <h2>{editingProduct ? "Ürünü Düzenle" : "Ürün Ekle"}</h2>
        <form ref={formRef} onSubmit={(e) => { e.preventDefault(); handleAddOrUpdateProduct(); }}>
          <input name="name" value={newProduct.name} onChange={handleChange} placeholder="Ürün Adı" required />
          <ReactQuill value={newProduct.description} onChange={handleDescriptionChange} placeholder="Ürün Açıklaması" />
          <input name="price" type="number" value={newProduct.price} onChange={handleChange} placeholder="Ürün Fiyatı" required />
          <select name="category" value={newProduct.category} onChange={handleChange} required>
            <option value="">Kategori Seç</option>
            {categories.map((cat) => (
              <option key={cat.name} value={cat.name}>{cat.name}</option>
            ))}
          </select>
          <select name="subcategory" value={newProduct.subcategory} onChange={handleChange}>
            <option value="">Alt Kategori Seç</option>
            {getSubcategories(newProduct.category).map((sub) => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
          <select name="subsubcategory" value={newProduct.subsubcategory} onChange={handleChange}>
            <option value="">Alt Alt Kategori Seç</option>
            {getSubsubcategories(newProduct.category, newProduct.subcategory).map((subsub) => (
              <option key={subsub} value={subsub}>{subsub}</option>
            ))}
          </select>
          <input name="image" value={newProduct.image} onChange={handleChange} placeholder="Ürün Resmi URL'si" />
          <label>
            <input name="onSale" type="checkbox" checked={newProduct.onSale} onChange={handleChange} />
            İndirimde
          </label>
          <button type="submit">{editingProduct ? "Güncelle" : "Ekle"}</button>
        </form>
      </Modal>
      <Modal isOpen={deleteModalIsOpen} onRequestClose={() => setDeleteModalIsOpen(false)}>
        <h2>Ürünü Sil</h2>
        <p>Bu ürünü silmek istediğinizden emin misiniz?</p>
        <button onClick={handleDeleteProduct}>Evet</button>
        <button onClick={() => setDeleteModalIsOpen(false)}>Hayır</button>
      </Modal>
    </div>
  );
};

export default ProductsTab;
