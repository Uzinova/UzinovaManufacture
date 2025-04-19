import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Image as ImageIcon, Plus, X, ArrowUpDown, Trash2, ExternalLink } from 'lucide-react';
import { db } from '../../lib/firebase';

interface CarouselImage {
  id: string;
  image_url: string;
  title: string | null;
  description: string | null;
  link_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function CarouselManager() {
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [editingImage, setEditingImage] = useState<CarouselImage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const imagesQuery = db.query(
        db.collection('carousel_images'),
        db.orderBy('display_order', 'asc')
      );
      
      const querySnapshot = await db.getDocs(imagesQuery);
      const fetchedImages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CarouselImage[];

      setImages(fetchedImages);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching images:', error);
      setIsLoading(false);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(images);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update display order
    const updatedImages = items.map((image, index) => ({
      ...image,
      display_order: index
    }));

    setImages(updatedImages);

    try {
      // Update all images with new display order
      await Promise.all(
        updatedImages.map(image => 
          db.updateDoc(db.doc(db, 'carousel_images', image.id), {
            display_order: image.display_order,
            updated_at: new Date().toISOString()
          })
        )
      );
    } catch (error) {
      console.error('Error updating image order:', error);
    }
  };

  const handleSaveImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingImage) return;

    try {
      if (editingImage.id) {
        // Update existing image
        await db.updateDoc(db.doc(db, 'carousel_images', editingImage.id), {
          ...editingImage,
          updated_at: new Date().toISOString()
        });
      } else {
        // Create new image
        await db.addDoc(db.collection('carousel_images'), {
          ...editingImage,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }

      setEditingImage(null);
      fetchImages();
    } catch (error) {
      console.error('Error saving image:', error);
    }
  };

  const handleDeleteImage = async (id: string) => {
    if (!id) {
      console.error('Error: Cannot delete image with empty ID');
      return;
    }
    
    try {
      await db.deleteDoc(db.doc(db, 'carousel_images', id));
      fetchImages();
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
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
        <h2 className="text-2xl font-bold">Carousel Images</h2>
        <button
          onClick={() => setEditingImage({
            id: '',
            image_url: '',
            title: '',
            description: '',
            link_url: '',
            display_order: images.length,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })}
          className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Image
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="images">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {images.map((image, index) => (
                <Draggable 
                  key={image.id} 
                  draggableId={String(image.id)} 
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="bg-accent rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div {...provided.dragHandleProps}>
                            <ArrowUpDown className="h-5 w-5 text-gray-400 cursor-move" />
                          </div>
                          <div className="w-16 h-16 bg-background rounded overflow-hidden">
                            {image.image_url ? (
                              <img
                                src={image.image_url}
                                alt={image.title || ''}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold">{image.title}</h3>
                            {image.description && (
                              <p className="text-sm text-gray-400">{image.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {image.link_url && (
                            <a
                              href={image.link_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80 transition-colors"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                          <button
                            onClick={() => setEditingImage(image)}
                            className="text-primary hover:text-primary/80 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteImage(image.id)}
                            className="text-red-500 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Edit Modal */}
      {editingImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-accent rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">
                  {editingImage.id ? 'Edit Image' : 'New Image'}
                </h3>
                <button
                  onClick={() => setEditingImage(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSaveImage} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Image URL</label>
                  <input
                    type="url"
                    value={editingImage.image_url}
                    onChange={(e) => setEditingImage({
                      ...editingImage,
                      image_url: e.target.value
                    })}
                    className="w-full bg-background px-4 py-2 rounded"
                    required
                    pattern="https?://.*"
                    title="Please enter a valid URL starting with http:// or https://"
                  />
                </div>

                {editingImage.image_url && validateUrl(editingImage.image_url) && (
                  <div className="relative aspect-video mb-4">
                    <img
                      src={editingImage.image_url}
                      alt={editingImage.title || ''}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={editingImage.title || ''}
                    onChange={(e) => setEditingImage({
                      ...editingImage,
                      title: e.target.value
                    })}
                    className="w-full bg-background px-4 py-2 rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={editingImage.description || ''}
                    onChange={(e) => setEditingImage({
                      ...editingImage,
                      description: e.target.value
                    })}
                    className="w-full bg-background px-4 py-2 rounded resize-none h-20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Link URL</label>
                  <input
                    type="url"
                    value={editingImage.link_url || ''}
                    onChange={(e) => setEditingImage({
                      ...editingImage,
                      link_url: e.target.value
                    })}
                    className="w-full bg-background px-4 py-2 rounded"
                    pattern="https?://.*"
                    title="Please enter a valid URL starting with http:// or https://"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={editingImage.is_active}
                    onChange={(e) => setEditingImage({
                      ...editingImage,
                      is_active: e.target.checked
                    })}
                    className="bg-background rounded"
                  />
                  <label htmlFor="is_active" className="text-sm">Active</label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground py-2 rounded hover:bg-primary/90 transition-colors"
                >
                  Save Image
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
