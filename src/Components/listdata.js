// src/listdata.js
import { db } from '../firebase'; // Adjust the path to your Firebase initialization
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';

export const fetchProducts = async () => {
  try {
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const fetchProductsOnSale = async () => {
  try {
    const productsRef = collection(db, 'products');
    const saleQuery = query(productsRef, where('onSale', '==', true));
    const snapshot = await getDocs(saleQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching products on sale:', error);
    return [];
  }
};

export const addProduct = async (product) => {
  try {
    const productsRef = collection(db, 'products');
    await addDoc(productsRef, product);
  } catch (error) {
    console.error('Error adding product:', error);
  }
};

export const deleteProduct = async (productId) => {
  try {
    const productRef = doc(db, 'products', productId);
    await deleteDoc(productRef);
  } catch (error) {
    console.error('Error deleting product:', error);
  }
};

export const fetchProductById = async (id) => {
  try {
    const productRef = doc(db, 'products', id);
    const snapshot = await getDoc(productRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    } else {
      console.error('No such product!');
      return null;
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
};

export const updateProduct = async (productId, updatedProduct) => {
  try {
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
  }
};

export const fetchCategories = async () => {
  try {
    const categoriesRef = collection(db, 'categories');
    const snapshot = await getDocs(categoriesRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

export const addCategory = async (categoryName) => {
  try {
    const categoriesRef = collection(db, 'categories');
    await addDoc(categoriesRef, { name: categoryName, subcategories: {} });
  } catch (error) {
    console.error('Error adding category:', error);
  }
};

export const addSubcategory = async (categoryName, subcategoryName, subsubcategoryName = null) => {
  try {
    const categoriesRef = collection(db, 'categories');
    const categoryQuery = query(categoriesRef, where('name', '==', categoryName));
    const snapshot = await getDocs(categoryQuery);
    if (!snapshot.empty) {
      const categoryDoc = snapshot.docs[0];
      const categoryData = categoryDoc.data();
      const categoryRef = doc(db, 'categories', categoryDoc.id);

      if (subsubcategoryName) {
        // Add subsubcategory
        if (!categoryData.subcategories[subcategoryName]) {
          categoryData.subcategories[subcategoryName] = {};
        }
        if (!categoryData.subcategories[subcategoryName][subsubcategoryName]) {
          categoryData.subcategories[subcategoryName][subsubcategoryName] = [];
        }
      } else {
        // Add subcategory
        if (!categoryData.subcategories[subcategoryName]) {
          categoryData.subcategories[subcategoryName] = [];
        }
      }

      await updateDoc(categoryRef, { subcategories: categoryData.subcategories });
    } else {
      console.error('No such category!');
    }
  } catch (error) {
    console.error('Error adding subcategory:', error);
  }
};
