import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { Trash2, Plus, AlertCircle } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  subcategories: string[];
  path?: string[];
}

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newSubcategory, setNewSubcategory] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; type: 'category' | 'subcategory'; subIndex?: number } | null>(null);

  // Fetch and normalize categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const snap = await db.getDocs(db.collection('categories'));
      const list = snap.docs.map(d => {
        const data = d.data() as { 
          name: string; 
          subcategories?: (string | { name: string } | unknown)[];
          path?: string[];
        };
        const rawSubs = data.subcategories ?? [];
        const cleanSubs = rawSubs.map(s =>
          typeof s === 'string'
            ? s
            : s && typeof s === 'object' && 'name' in s
              ? (s as { name: string }).name
              : String(s)
        );
        return {
          id: d.id,
          name: data.name,
          subcategories: cleanSubs,
          path: data.path || [data.name], // Ensure path exists
        };
      });
      setCategories(list);
      setError(null);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Unable to load categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Add a new top-level category
  const addCategory = async () => {
    const name = newCategory.trim();
    if (!name) return;
    if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      setError('This category already exists.');
      return;
    }
    setActionLoading(true);
    try {
      const path = [name]; // For top-level categories, path is just the name
      const ref = await db.addDoc(db.collection('categories'), { 
        name, 
        subcategories: [],
        path
      });
      setCategories(prev => [...prev, { id: ref.id, name, subcategories: [], path }]);
      setNewCategory('');
      setError(null);
    } catch (err) {
      console.error('Error adding category:', err);
      setError('Unable to add category.');
    } finally {
      setActionLoading(false);
    }
  };

  // Add a new subcategory under the selected category
  const addSubcategory = async () => {
    if (!selectedCategoryId) return;
    const sub = newSubcategory.trim();
    if (!sub) return;

    const parent = categories.find(c => c.id === selectedCategoryId)!;
    if (parent.subcategories.some(s => s.toLowerCase() === sub.toLowerCase())) {
      setError('This subcategory already exists.');
      return;
    }

    setActionLoading(true);
    try {
      const updatedSubs = [...parent.subcategories, sub];
      // Call db.doc with undefined as first param to match wrapper signature
      const docRef = db.doc(undefined, 'categories', selectedCategoryId);
      
      // Create subcategory path based on parent path
      const parentName = parent.name;
      const subcategoryPath = [...(parent.path || [parentName]), sub];
      
      // Create a new subcategory document
      const subcategoryRef = await db.addDoc(db.collection('categories'), {
        name: sub,
        parent_id: selectedCategoryId,
        path: subcategoryPath,
        subcategories: []
      });
      
      // Update parent category's subcategories
      await db.updateDoc(docRef, { subcategories: updatedSubs });
      
      // Update local state
      setCategories(prev => [
        ...prev.map(c =>
          c.id === selectedCategoryId
            ? { ...c, subcategories: updatedSubs }
            : c
        ),
        // Add the new subcategory to the categories list
        {
          id: subcategoryRef.id,
          name: sub,
          subcategories: [],
          path: subcategoryPath
        }
      ]);
      
      setNewSubcategory('');
      setError(null);
    } catch (err) {
      console.error('Error adding subcategory:', err);
      setError('Unable to add subcategory.');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete a category
  const deleteCategory = async (categoryId: string) => {
    setActionLoading(true);
    try {
      const docRef = db.doc(undefined, 'categories', categoryId);
      await db.deleteDoc(docRef);
      
      // Remove any subcategories if they exist as full category entries
      const category = categories.find(c => c.id === categoryId);
      if (category) {
        const subCategoryDocs = categories.filter(c => 
          c.path && c.path.length > 1 && c.path[0] === category.name
        );
        
        // Delete all subcategory documents
        for (const subCat of subCategoryDocs) {
          const subDocRef = db.doc(undefined, 'categories', subCat.id);
          await db.deleteDoc(subDocRef);
        }
      }
      
      // Update local state by removing the category and all its subcategories
      setCategories(prev => prev.filter(c => 
        c.id !== categoryId && 
        !(c.path && c.path.length > 1 && category && c.path[0] === category.name)
      ));
      
      if (selectedCategoryId === categoryId) {
        setSelectedCategoryId(null);
      }
      setError(null);
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Unable to delete category.');
    } finally {
      setActionLoading(false);
      setConfirmDelete(null);
    }
  };

  // Delete a subcategory
  const deleteSubcategory = async (categoryId: string, subIndex: number) => {
    setActionLoading(true);
    try {
      const category = categories.find(c => c.id === categoryId);
      if (!category) {
        setError('Category not found.');
        return;
      }

      const updatedSubs = [...category.subcategories];
      const removedSubName = updatedSubs[subIndex];
      updatedSubs.splice(subIndex, 1);

      const docRef = db.doc(undefined, 'categories', categoryId);
      await db.updateDoc(docRef, { subcategories: updatedSubs });
      
      // Find and delete the subcategory document if it exists
      const subcategoryDoc = categories.find(c => 
        c.path && 
        c.path.length > 1 && 
        c.path[0] === category.name && 
        c.name === removedSubName
      );
      
      if (subcategoryDoc) {
        const subDocRef = db.doc(undefined, 'categories', subcategoryDoc.id);
        await db.deleteDoc(subDocRef);
      }
      
      // Update local state
      setCategories(prev => 
        prev.filter(c => 
          !(c.path && 
            c.path.length > 1 && 
            c.path[0] === category.name && 
            c.name === removedSubName)
        ).map(c =>
          c.id === categoryId
            ? { ...c, subcategories: updatedSubs }
            : c
        )
      );
      
      setError(null);
    } catch (err) {
      console.error('Error deleting subcategory:', err);
      setError('Unable to delete subcategory.');
    } finally {
      setActionLoading(false);
      setConfirmDelete(null);
    }
  };

  // Group categories by hierarchy
  const groupedCategories = categories.filter(cat => 
    !cat.path || cat.path.length === 1 // Only top-level categories
  );

  if (loading) {
    return <p className="text-white">Loading categories…</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-black text-white p-6">
      <h2 className="text-2xl font-bold mb-4">Category Manager</h2>
      {error && (
        <div className="mb-4 bg-red-900/50 border border-red-500 p-3 rounded-lg flex items-center">
          <AlertCircle className="text-red-500 mr-2 h-5 w-5" />
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Add Category */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="New Category"
          value={newCategory}
          onChange={e => setNewCategory(e.target.value)}
          className="flex-1 bg-black bg-opacity-50 placeholder-orange-200 border border-orange-400 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-300"
          disabled={actionLoading}
        />
        <button
          onClick={addCategory}
          className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded disabled:opacity-50 flex items-center"
          disabled={actionLoading}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add
        </button>
      </div>

      {/* Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-orange-900 to-black p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
            <p className="mb-6">
              {confirmDelete.type === 'category'
                ? `Are you sure you want to delete the category "${categories.find(c => c.id === confirmDelete.id)?.name}"? This will also delete all subcategories.`
                : `Are you sure you want to delete the subcategory "${categories.find(c => c.id === confirmDelete.id)?.subcategories[confirmDelete.subIndex!]}"?`}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmDelete.type === 'category') {
                    deleteCategory(confirmDelete.id);
                  } else {
                    deleteSubcategory(confirmDelete.id, confirmDelete.subIndex!);
                  }
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category List & Subcategory Manager */}
      <ul className="space-y-4">
        {groupedCategories.map(cat => (
          <li key={cat.id} className="bg-black bg-opacity-40 p-4 rounded">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-semibold">{cat.name}</span>
                <button
                  onClick={() => setConfirmDelete({ id: cat.id, type: 'category' })}
                  className="text-red-400 hover:text-red-300 transition-colors p-1 rounded-full hover:bg-red-900/20"
                  disabled={actionLoading}
                  title="Delete category"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={() => setSelectedCategoryId(cat.id)}
                className="text-orange-300 hover:text-orange-100 disabled:opacity-50"
                disabled={actionLoading}
              >
                + Subcategory
              </button>
            </div>

            <ul className="ml-6 space-y-1">
              {cat.subcategories.map((sub, idx) => (
                <li key={`${cat.id}-${idx}`} className="flex items-center justify-between group">
                  <span>{sub}</span>
                  <button
                    onClick={() => setConfirmDelete({ id: cat.id, type: 'subcategory', subIndex: idx })}
                    className="text-red-400 hover:text-red-300 transition-colors p-1 rounded-full hover:bg-red-900/20 opacity-0 group-hover:opacity-100"
                    disabled={actionLoading}
                    title="Delete subcategory"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </li>
              ))}
            </ul>

            {selectedCategoryId === cat.id && (
              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  placeholder="New Subcategory"
                  value={newSubcategory}
                  onChange={e => setNewSubcategory(e.target.value)}
                  className="flex-1 bg-black bg-opacity-50 placeholder-orange-200 border border-orange-400 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-300"
                  disabled={actionLoading}
                />
                <button
                  onClick={addSubcategory}
                  className="bg-orange-800 hover:bg-orange-900 text-white px-5 py-2 rounded disabled:opacity-50 flex items-center"
                  disabled={actionLoading}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}