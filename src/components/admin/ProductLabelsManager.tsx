import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Edit2 } from 'lucide-react';
import { db } from '../../lib/firebase';

interface ProductLabel {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export function ProductLabelsManager() {
  const [labels, setLabels] = useState<ProductLabel[]>([]);
  const [editingLabel, setEditingLabel] = useState<ProductLabel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLabels();
  }, []);

  const fetchLabels = async () => {
    try {
      const labelsQuery = db.query(
        db.collection('product_labels'),
        db.orderBy('name')
      );
      
      const querySnapshot = await db.getDocs(labelsQuery);
      const fetchedLabels = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ProductLabel[];

      setLabels(fetchedLabels);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching labels:', error);
      setIsLoading(false);
    }
  };

  const handleSaveLabel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLabel) return;

    try {
      if (editingLabel.id) {
        // Update existing label
        await db.updateDoc(db.doc(db, 'product_labels', editingLabel.id), {
          ...editingLabel,
          updated_at: new Date().toISOString()
        });
      } else {
        // Create new label
        await db.addDoc(db.collection('product_labels'), {
          ...editingLabel,
          created_at: new Date().toISOString()
        });
      }

      setEditingLabel(null);
      fetchLabels();
    } catch (error) {
      console.error('Error saving label:', error);
    }
  };

  const handleDeleteLabel = async (id: string) => {
    if (!id) {
      console.error('Error: Cannot delete label with empty ID');
      return;
    }
    
    try {
      await db.deleteDoc(db.doc(db, 'product_labels', id));
      fetchLabels();
    } catch (error) {
      console.error('Error deleting label:', error);
    }
  };

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
        <h2 className="text-2xl font-bold">Product Labels</h2>
        <button
          onClick={() => setEditingLabel({
      
            name: '',
            color: '#fb923c', // Default orange color
            created_at: new Date().toISOString()
          })}
          className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Label
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {labels.map(label => (
          <div key={label.id} className="bg-accent rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: label.color }}
              ></div>
              <span className="font-medium">{label.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setEditingLabel(label)}
                className="text-primary hover:text-primary/80 transition-colors p-1"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDeleteLabel(label.id)}
                className="text-red-500 hover:text-red-600 transition-colors p-1"
                disabled={!label.id}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingLabel && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-accent rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">
                  {editingLabel.id ? 'Edit Label' : 'New Label'}
                </h3>
                <button
                  onClick={() => setEditingLabel(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSaveLabel} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Label Name</label>
                  <input
                    type="text"
                    value={editingLabel.name}
                    onChange={(e) => setEditingLabel({
                      ...editingLabel,
                      name: e.target.value
                    })}
                    className="w-full bg-background px-4 py-2 rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Color</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={editingLabel.color}
                      onChange={(e) => setEditingLabel({
                        ...editingLabel,
                        color: e.target.value
                      })}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={editingLabel.color}
                      onChange={(e) => setEditingLabel({
                        ...editingLabel,
                        color: e.target.value
                      })}
                      className="flex-1 bg-background px-4 py-2 rounded"
                      pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                      title="Please enter a valid hex color code (e.g., #fb923c)"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">Preview</label>
                  <div className="flex items-center gap-2">
                    <div 
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${editingLabel.color}20`,
                        color: editingLabel.color,
                      }}
                    >
                      {editingLabel.name || 'Label preview'}
                    </div>
                    <div 
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        backgroundColor: editingLabel.color,
                        color: '#000000'
                      }}
                    >
                      {editingLabel.name || 'Label preview'}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground py-2 rounded hover:bg-primary/90 transition-colors mt-4"
                >
                  Save Label
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
