import React, { useState, useEffect, useRef } from 'react';
import Modal from 'react-modal';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { fetchProducts, addProduct, deleteProduct, updateProduct, fetchCategories, addCategory, addSubcategory, deleteCategory, deleteSubcategory, deleteSubsubcategory } from '../listdata';
import './ProductsTab.css';

// Set the app element for react-modal to hide everything outside the modal for screen readers.
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

  const formRef = useRef(null); // Reference to the form element

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

  const handleAddOrUpdateProduct = async () => {
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
    setNewProduct(product);
    setModalIsOpen(true);
    // Scroll to the form when an edit button is clicked
    formRef.current.scrollIntoView({ behavior: 'smooth' });
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

  const toggleExpand = (e) => {
    const listItem = e.currentTarget.parentElement;
    const nestedList = listItem.querySelector('ul');
    if (nestedList) {
      nestedList.classList.toggle('collapsed');
    }
  };

  const renderCategoryTree = (category) => (
    <li key={`category-${category.id}`}>
      <div onClick={toggleExpand} className="tree-node-label">
        {category.name}
        <button onClick={() => handleDeleteCategory(category.id)}>Sil</button>
      </div>
      {Object.keys(category.subcategories).length > 0 && (
        <ul className="tree-node">
          {Object.keys(category.subcategories).map(subcategoryName => (
            <li key={`subcategory-${category.id}-${subcategoryName}`}>
              <div onClick={toggleExpand} className="tree-node-label">
                {subcategoryName}
                <button onClick={() => handleDeleteSubcategory(category.id, subcategoryName)}>Sil</button>
              </div>
              {Object.keys(category.subcategories[subcategoryName]).length > 0 && (
                <ul className="tree-node">
                  {Object.keys(category.subcategories[subcategoryName]).map(subsubcategoryName => (
                    <li key={`subsubcategory-${category.id}-${subcategoryName}-${subsubcategoryName}`}>
                      <div className="tree-node-label">
                        {subsubcategoryName}
                        <button onClick={() => handleDeleteSubsubcategory(category.id, subcategoryName, subsubcategoryName)}>Sil</button>
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
      <h3 ref={formRef}>{editingProduct ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}</h3> {/* Added ref to the form header */}
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
        <button onClick={() => setModalIsOpen(true)}>{editingProduct ? 'Ürünü Güncelle' : 'Ürün Ekle'}</button>
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        className="modal"
        overlayClassName="modal-overlay"
      >
        <h2>{editingProduct ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}</h2>
        <div className="modal-content">
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
          <button onClick={handleAddOrUpdateProduct}>{editingProduct ? 'Güncelle' : 'Ekle'}</button>
          <button onClick={() => setModalIsOpen(false)}>İptal</button>
        </div>
      </Modal>

      <h3>Kategoriler</h3>
      <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Yeni Kategori" />
      <button onClick={handleAddCategory}>Ekle</button>

      <h4>Alt Kategori Ekle</h4>
      <select onChange={(e) => setSelectedCategory(e.target.value)}>
        <option value="">Kategori Seçin</option>
        {categories.map(category => (
          <option key={category.id} value={category.name}>{category.name}</option>
        ))}
      </select>
      <input type="text" value={newSubcategory} onChange={(e) => setNewSubcategory(e.target.value)} placeholder="Yeni Alt Kategori" />
      <button onClick={handleAddSubcategory}>Ekle</button>

      <h4>Alt Alt Kategori Ekle</h4>
      <select onChange={(e) => setSelectedCategory(e.target.value)}>
        <option value="">Kategori Seçin</option>
        {categories.map(category => (
          <option key={category.id} value={category.name}>{category.name}</option>
        ))}
      </select>
      <select onChange={(e) => setSelectedSubcategory(e.target.value)}>
        <option value="">Alt Kategori Seçin</option>
        {categories.find(cat => cat.name === selectedCategory)?.subcategories &&
          Object.keys(categories.find(cat => cat.name === selectedCategory).subcategories).map(subcat => (
            <option key={subcat} value={subcat}>{subcat}</option>
        ))}
      </select>
      <input type="text" value={newSubsubcategory} onChange={(e) => setNewSubsubcategory(e.target.value)} placeholder="Yeni Alt Alt Kategori" />
      <button onClick={handleAddSubsubcategory}>Ekle</button>

      <ul className="category-tree">
        {categories.map(renderCategoryTree)}
      </ul>

      <h3>Ürünler</h3>
      <ul className="products-list">
        {products.map((product) => (
          <li key={product.id}>
            <span>{product.name}</span>
            <button onClick={() => handleEditProduct(product)}>Düzenle</button>
            <button onClick={() => { setProductToDelete(product); setDeleteModalIsOpen(true); }}>Sil</button>
          </li>
        ))}
      </ul>

      <Modal
        isOpen={deleteModalIsOpen}
        onRequestClose={() => setDeleteModalIsOpen(false)}
        className="modal"
        overlayClassName="modal-overlay"
      >
        <h2>Ürünü Sil</h2>
        <div className="modal-content">
          <p>Bu ürünü silmek istediğinizden emin misiniz?</p>
          <button onClick={handleDeleteProduct}>Evet</button>
          <button onClick={() => setDeleteModalIsOpen(false)}>Hayır</button>
        </div>
      </Modal>
    </div>
  );
};

export default ProductsTab;
