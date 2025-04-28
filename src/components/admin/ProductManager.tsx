import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Edit2, Image as ImageIcon, Tag, Calendar, Package } from 'lucide-react';
import { db } from '../../lib/firebase';
import RichTextEditor from '../RichTextEditor';

interface ProductCategory {
  id: string;
  name: string;
  parent_id?: string | null;
  path?: string[];
  created_at: string;
  subcategories?: string[];
}

interface ProductLabel {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

interface Product {
  id?: string;
  name: string;
  price: number;
  description: string;
  category: string;
  subcategory: string;
  categoryPath: string[];
  images: string[];
  mainImageIndex: number;
  stock: number;
  featured: boolean;
  sku: string;
  discount_rate?: number;
  discount_start?: string;
  discount_end?: string;
  labels?: string[];
  created_at: string;
  updated_at: string;
}

export function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [labels, setLabels] = useState<ProductLabel[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newImageUrl, setNewImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'featured' | 'discounted'>('all');

  useEffect(() => {
    Promise.all([
      fetchProducts(),
      fetchCategories(),
      fetchLabels()
    ]).then(() => {
      setIsLoading(false);
    }).catch(error => {
      console.error('Error initializing product manager:', error);
      setIsLoading(false);
    });
  }, []);

  const fetchProducts = async () => {
    try {
      const productsQuery = db.query(
        db.collection('products'),
        db.orderBy('name')
      );

      const querySnapshot = await db.getDocs(productsQuery);
      const fetchedProducts = querySnapshot.docs.map(doc => {
        // Cast document data to a specific type instead of any
        const data = doc.data() as {
          name: string;
          price: number;
          description: string;
          category: string;
          subcategory: string;
          categoryPath: string[];
          images: string[];
          mainImageIndex: number;
          stock: number;
          featured: boolean;
          sku: string;
          discount_rate?: number;
          discount_start?: string;
          discount_end?: string;
          labels?: string[];
          created_at: string;
          updated_at: string;
        };
        return {
          id: doc.id,
          ...data
        } as Product;
      });

      setProducts(fetchedProducts);
      return fetchedProducts;
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  };

  const fetchCategories = async () => {
    try {
      const categoriesQuery = db.query(
        db.collection('categories'),
        db.orderBy('name')
      );

      const querySnapshot = await db.getDocs(categoriesQuery);
      const fetchedCategories = querySnapshot.docs.map(doc => {
        // Cast document data to a specific type instead of any
        const data = doc.data() as {
          name: string;
          parent_id?: string | null;
          path?: string[];
          created_at?: string;
          subcategories?: string[];
        };
        
        return {
          id: doc.id,
          name: data.name || '',
          parent_id: data.parent_id || null,
          path: data.path || [data.name || ''],
          created_at: data.created_at || new Date().toISOString(),
          subcategories: Array.isArray(data.subcategories) ? data.subcategories : []
        } as ProductCategory;
      });

      console.log('Fetched Categories with subcategories:', fetchedCategories);
      setCategories(fetchedCategories);
      return fetchedCategories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  };

  const fetchLabels = async () => {
    try {
      const labelsQuery = db.query(
        db.collection('product_labels'),
        db.orderBy('name')
      );

      const querySnapshot = await db.getDocs(labelsQuery);
      const fetchedLabels = querySnapshot.docs.map(doc => {
        // Cast document data to a specific type instead of any
        const data = doc.data() as {
          name: string;
          color: string;
          created_at: string;
        };
        return {
          id: doc.id,
          ...data
        } as ProductLabel;
      });

      setLabels(fetchedLabels);
      return fetchedLabels;
    } catch (error) {
      console.error('Error fetching labels:', error);
      return [];
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      if (editingProduct.id) {
        // Update existing product
        await db.updateDoc(db.doc(db, 'products', editingProduct.id), {
          ...editingProduct,
          updated_at: new Date().toISOString()
        });
      } else {
        // Create new product
        const { id, ...productData } = editingProduct;
        await db.addDoc(db.collection('products'), {
          ...productData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }

      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await db.deleteDoc(db.doc(db, 'products', id));
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleBulkAction = async (action: 'delete' | 'feature' | 'unfeature') => {
    if (!selectedProducts.length) return;

    try {
      switch (action) {
        case 'delete':
          await Promise.all(
            selectedProducts.map(id => id && db.deleteDoc(db.doc(db, 'products', id)))
          );
          break;

        case 'feature':
        case 'unfeature':
          await Promise.all(
            selectedProducts.map(id => id && db.updateDoc(db.doc(db, 'products', id), {
              featured: action === 'feature',
              updated_at: new Date().toISOString()
            }))
          );
          break;
      }

      setSelectedProducts([]);
      fetchProducts();
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  const handleAddImage = () => {
    if (!editingProduct || !newImageUrl.trim()) return;

    setEditingProduct({
      ...editingProduct,
      images: [...(editingProduct.images || []), newImageUrl]
    });
    setNewImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    if (!editingProduct) return;

    const newImages = [...editingProduct.images];
    newImages.splice(index, 1);

    // If removing the main image, reset the main image index
    const newMainImageIndex = editingProduct.mainImageIndex === index
      ? 0
      : editingProduct.mainImageIndex > index
        ? editingProduct.mainImageIndex - 1
        : editingProduct.mainImageIndex;

    setEditingProduct({
      ...editingProduct,
      images: newImages,
      mainImageIndex: newMainImageIndex
    });
  };

  const handleSetMainImage = (index: number) => {
    if (!editingProduct) return;

    setEditingProduct({
      ...editingProduct,
      mainImageIndex: index
    });
  };

  const toggleLabelSelection = (labelId: string) => {
    if (!editingProduct) return;

    const currentLabels = editingProduct.labels || [];
    const newLabels = currentLabels.includes(labelId)
      ? currentLabels.filter(id => id !== labelId)
      : [...currentLabels, labelId];

    setEditingProduct({
      ...editingProduct,
      labels: newLabels
    });
  };

  const generateSKU = (name: string) => {
    if (!name) return '';

    const prefix = name.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString(36).substring(0, 4).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();

    return `${prefix}-${timestamp}-${random}`;
  };

  const filteredProducts = products.filter(product => {
    // Text search
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by type
    const matchesFilter =
      filter === 'all' ? true :
        filter === 'featured' ? product.featured :
          filter === 'discounted' ? !!product.discount_rate :
            true;

    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Products</h2>
        <button
          onClick={() => setEditingProduct({
            name: '',
            description: '',
            price: 0,
            stock: 0,
            category: '',
            subcategory: '',
            categoryPath: [],
            images: [],
            mainImageIndex: 0,
            featured: false,
            sku: generateSKU(''),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })}
          className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-accent px-4 py-2 rounded"
          />
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-accent'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('featured')}
            className={`px-3 py-1 rounded ${filter === 'featured' ? 'bg-primary text-primary-foreground' : 'bg-accent'}`}
          >
            Featured
          </button>
          <button
            onClick={() => setFilter('discounted')}
            className={`px-3 py-1 rounded ${filter === 'discounted' ? 'bg-primary text-primary-foreground' : 'bg-accent'}`}
          >
            Discounted
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="bg-accent p-4 rounded-lg flex items-center justify-between">
          <span>{selectedProducts.length} products selected</span>
          <div className="space-x-2">
            <button
              onClick={() => handleBulkAction('feature')}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
            >
              Feature
            </button>
            <button
              onClick={() => handleBulkAction('unfeature')}
              className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition-colors"
            >
              Unfeature
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Products List */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-accent">
              <th className="p-3 text-left">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedProducts(filteredProducts.map(p => p.id).filter((id): id is string => typeof id === 'string'));
                    } else {
                      setSelectedProducts([]);
                    }
                  }}
                  className="bg-background rounded"
                />
              </th>
              <th className="p-3 text-left">Image</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Stock</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">SKU</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => (
              <tr key={product.id} className="border-b border-accent hover:bg-accent/50">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={product.id ? selectedProducts.includes(product.id) : false}
                    onChange={(e) => {
                      if (e.target.checked && product.id) {
                        setSelectedProducts([...selectedProducts, product.id]);
                      } else if (product.id) {
                        setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                      }
                    }}
                    className="bg-background rounded"
                  />
                </td>
                <td className="p-3">
                  <div className="w-12 h-12 bg-background rounded overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[product.mainImageIndex || 0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-3">
                  <div className="font-medium">
                    {product.name}
                    {product.featured && (
                      <span className="ml-2 bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">
                        Featured
                      </span>
                    )}
                  </div>
                  {product.labels && product.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {product.labels.map(labelId => {
                        const label = labels.find(l => l.id === labelId);
                        if (!label) return null;
                        return (
                          <span
                            key={label.id}
                            className="px-1 py-0.5 rounded-full text-xs"
                            style={{
                              backgroundColor: `${label.color}20`,
                              color: label.color
                            }}
                          >
                            {label.name}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </td>
                <td className="p-3">
                  {product.discount_rate ? (
                    <div>
                      <span className="line-through text-gray-400">
                        {product.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                      </span>
                      <span className="block text-primary">
                        {(product.price * (1 - product.discount_rate / 100)).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                      </span>
                    </div>
                  ) : (
                    <span>
                      {product.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </span>
                  )}
                </td>
                <td className="p-3">
                  <span className={`${product.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {product.stock}
                  </span>
                </td>
                <td className="p-3">
                  {product.categoryPath?.join(' > ') || product.category || '—'}
                </td>
                <td className="p-3 text-gray-400 text-sm">
                  {product.sku}
                </td>
                <td className="p-3">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditingProduct(product)}
                      className="text-primary hover:text-primary/80 transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => product.id && handleDeleteProduct(product.id)}
                      className="text-red-500 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-accent rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">
                  {editingProduct.id ? 'Edit Product' : 'New Product'}
                </h3>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-6">
                {/* Basic Information Section */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Basic Information
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Product Name</label>
                      <input
                        type="text"
                        value={editingProduct.name}
                        onChange={(e) => {
                          const name = e.target.value;
                          setEditingProduct({
                            ...editingProduct,
                            name,
                            sku: editingProduct.sku || generateSKU(name)
                          });
                        }}
                        className="w-full bg-background px-4 py-2 rounded"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">SKU</label>
                      <input
                        type="text"
                        value={editingProduct.sku}
                        onChange={(e) => setEditingProduct({
                          ...editingProduct,
                          sku: e.target.value
                        })}
                        className="w-full bg-background px-4 py-2 rounded"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Price (TRY)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editingProduct.price}
                        onChange={(e) => setEditingProduct({
                          ...editingProduct,
                          price: parseFloat(e.target.value)
                        })}
                        className="w-full bg-background px-4 py-2 rounded"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Stock</label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={editingProduct.stock}
                        onChange={(e) => setEditingProduct({
                          ...editingProduct,
                          stock: parseInt(e.target.value)
                        })}
                        className="w-full bg-background px-4 py-2 rounded"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Category</label>
                      <select
                        value={editingProduct.category}
                        onChange={(e) => {
                          const categoryName = e.target.value;
                          console.log('Selected category name:', categoryName);
                          
                          const selectedCategory = categories.find(cat => cat.name === categoryName);
                          console.log('Selected category object:', selectedCategory);
                          
                          setEditingProduct({
                            ...editingProduct,
                            category: categoryName,
                            subcategory: '', // Reset subcategory when category changes
                            categoryPath: selectedCategory?.path || [categoryName]
                          });
                        }}
                        className="w-full bg-background px-4 py-2 rounded"
                      >
                        <option value="">Select category</option>
                        {categories.map(category => {
                          return (
                            <option key={category.id} value={category.name}>
                              {category.name}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Subcategory</label>
                      <select
                        value={editingProduct.subcategory}
                        onChange={(e) => {
                          console.log('Selected subcategory:', e.target.value);
                          setEditingProduct({
                            ...editingProduct,
                            subcategory: e.target.value,
                          });
                        }}
                        className="w-full bg-background px-4 py-2 rounded"
                      >
                        <option value="">Select subcategory</option>
                        {editingProduct.category ? (
                          (() => {
                            const categoryObj = categories.find(cat => cat.name === editingProduct.category);
                            if (!categoryObj) {
                              return <option value="" disabled>Category not found</option>;
                            }
                            
                            if (!categoryObj.subcategories || categoryObj.subcategories.length === 0) {
                              return <option value="" disabled>No subcategories available</option>;
                            }
                            
                            // Return array of option elements explicitly
                            return categoryObj.subcategories.map((subName, index) => {
                              if (typeof subName !== 'string') {
                                console.error('Invalid subcategory type:', subName);
                                return null;
                              }
                              return (
                                <option key={`${categoryObj.id}-${index}`} value={subName}>
                                  {subName}
                                </option>
                              );
                            });
                          })()
                        ) : null}
                      </select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={editingProduct.featured}
                        onChange={(e) => setEditingProduct({
                          ...editingProduct,
                          featured: e.target.checked
                        })}
                        className="bg-background rounded"
                      />
                      <label htmlFor="featured" className="text-sm">
                        Featured Product
                      </label>
                    </div>
                  </div>
                </div>

                {/* Description Section */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold">Description</h4>
                  <RichTextEditor
                    content={editingProduct.description}
                    onChange={(content) => setEditingProduct({
                      ...editingProduct,
                      description: content
                    })}
                  />
                </div>

                {/* Images Section */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold flex items-center">
                    <ImageIcon className="h-5 w-5 mr-2" />
                    Images
                  </h4>

                  <div className="flex items-end space-x-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-2">
                        Add Image URL
                      </label>
                      <input
                        type="url"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="w-full bg-background px-4 py-2 rounded"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddImage}
                      className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-colors"
                    >
                      Add
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {editingProduct.images?.map((image, index) => (
                      <div key={index} className="relative group">
                        <div
                          className={`aspect-square rounded-lg overflow-hidden border-2 ${editingProduct.mainImageIndex === index
                            ? 'border-primary'
                            : 'border-transparent'
                            }`}
                        >
                          <img
                            src={image}
                            alt={`Product Image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => handleSetMainImage(index)}
                            className="bg-primary text-white p-1 rounded-full mr-2"
                            title="Set as main image"
                          >
                            <ImageIcon className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="bg-red-500 text-white p-1 rounded-full"
                            title="Remove image"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        {editingProduct.mainImageIndex === index && (
                          <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs px-1 rounded">
                            Main
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Labels Section */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold flex items-center">
                    <Tag className="h-5 w-5 mr-2" />
                    Labels
                  </h4>

                  <div className="flex flex-wrap gap-2">
                    {labels.map(label => (
                      <button
                        key={label.id}
                        type="button"
                        onClick={() => toggleLabelSelection(label.id)}
                        className={`px-3 py-1.5 rounded-full text-sm flex items-center transition-colors ${editingProduct.labels?.includes(label.id)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-accent'
                          }`}
                      >
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: label.color }}
                        ></div>
                        {label.name}
                      </button>
                    ))}
                    {labels.length === 0 && (
                      <p className="text-gray-400 text-sm">
                        No labels available. Add labels in the Labels section.
                      </p>
                    )}
                  </div>
                </div>

                {/* Discount Section */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Discount
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Discount Rate (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editingProduct.discount_rate || ''}
                        onChange={(e) => setEditingProduct({
                          ...editingProduct,
                          discount_rate: e.target.value ? parseFloat(e.target.value) : undefined
                        })}
                        className="w-full bg-background px-4 py-2 rounded"
                        placeholder="e.g. 20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Start Date
                      </label>
                      <input
                        type="datetime-local"
                        value={editingProduct.discount_start?.split('.')[0] || ''}
                        onChange={(e) => setEditingProduct({
                          ...editingProduct,
                          discount_start: e.target.value ? new Date(e.target.value).toISOString() : undefined
                        })}
                        className="w-full bg-background px-4 py-2 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        End Date
                      </label>
                      <input
                        type="datetime-local"
                        value={editingProduct.discount_end?.split('.')[0] || ''}
                        onChange={(e) => setEditingProduct({
                          ...editingProduct,
                          discount_end: e.target.value ? new Date(e.target.value).toISOString() : undefined
                        })}
                        className="w-full bg-background px-4 py-2 rounded"
                      />
                    </div>
                  </div>

                  {editingProduct.discount_rate && (
                    <div className="bg-primary/10 p-4 rounded-lg">
                      <p className="text-sm">
                        <span className="font-bold">Original Price:</span> {editingProduct.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                      </p>
                      <p className="text-sm text-primary">
                        <span className="font-bold">Discounted Price:</span> {(editingProduct.price * (1 - (editingProduct.discount_rate || 0) / 100)).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground py-3 rounded hover:bg-primary/90 transition-colors"
                >
                  Save Product
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
