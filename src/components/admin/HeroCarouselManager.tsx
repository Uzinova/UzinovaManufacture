import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Image as ImageIcon, Calendar, Trash2, Plus, X, ArrowUpDown } from 'lucide-react';
import { db } from '../../lib/firebase';

interface HeroSlide {
  id: string;
  image_url: string;
  title: string;
  subtitle?: string;
  cta_text?: string;
  cta_url?: string;
  display_order: number;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export function HeroCarouselManager() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const slidesQuery = db.query(
        db.collection('hero_slides'),
        db.orderBy('display_order', 'asc')
      );
      
      const querySnapshot = await db.getDocs(slidesQuery);
      const fetchedSlides = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HeroSlide[];

      setSlides(fetchedSlides);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching slides:', error);
      setIsLoading(false);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(slides);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update display order
    const updatedSlides = items.map((slide, index) => ({
      ...slide,
      display_order: index
    }));

    setSlides(updatedSlides);

    // Update in database
    try {
      await Promise.all(
        updatedSlides.map(slide => 
          db.updateDoc(db.doc(db, 'hero_slides', slide.id), {
            display_order: slide.display_order,
            updated_at: new Date().toISOString()
          })
        )
      );
    } catch (error) {
      console.error('Error updating slide order:', error);
    }
  };

  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide) return;

    try {
      // Exclude the id field from the data to be saved
      const { id, ...slideData } = editingSlide;

      if (id) {
        // Update existing slide
        await db.updateDoc(db.doc(db, 'hero_slides', id), {
          ...slideData,
          updated_at: new Date().toISOString()
        });
      } else {
        // Create new slide
        await db.addDoc(db.collection('hero_slides'), {
          ...slideData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }

      setEditingSlide(null);
      fetchSlides();
    } catch (error) {
      console.error('Error saving slide:', error);
    }
  };

  const handleDeleteSlide = async (id: string) => {
    if (!id) {
      console.error('Error: Cannot delete slide with empty ID');
      return;
    }
    
    try {
      await db.deleteDoc(db.doc(db, 'hero_slides', id));
      fetchSlides();
    } catch (error) {
      console.error('Error deleting slide:', error);
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
        <h2 className="text-2xl font-bold">Hero Carousel</h2>
        <button
          onClick={() => setEditingSlide({
            id: '',
            image_url: '',
            title: '',
            subtitle: '',
            display_order: slides.length,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })}
          className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Slide
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="slides">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {slides.map((slide, index) => (
                <Draggable 
                  key={slide.id} 
                  draggableId={String(slide.id)} 
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
                            {slide.image_url ? (
                              <img
                                src={slide.image_url}
                                alt={slide.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold">{slide.title}</h3>
                            {slide.subtitle && (
                              <p className="text-sm text-gray-400">{slide.subtitle}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setEditingSlide(slide)}
                            className="text-primary hover:text-primary/80 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteSlide(slide.id)}
                            className="text-red-500 hover:text-red-600 transition-colors"
                            disabled={!slide.id}
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
      {editingSlide && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-accent rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">
                  {editingSlide.id ? 'Edit Slide' : 'New Slide'}
                </h3>
                <button
                  onClick={() => setEditingSlide(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSaveSlide} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Image URL</label>
                  <input
                    type="text"
                    value={editingSlide.image_url}
                    onChange={(e) => setEditingSlide({
                      ...editingSlide,
                      image_url: e.target.value
                    })}
                    className="w-full bg-background px-4 py-2 rounded"
                    required
                  />
                </div>

                {editingSlide.image_url && validateUrl(editingSlide.image_url) && (
                  <div className="relative aspect-video mb-4">
                    <img
                      src={editingSlide.image_url}
                      alt={editingSlide.title}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Title (max 50 characters)
                  </label>
                  <input
                    type="text"
                    value={editingSlide.title}
                    onChange={(e) => setEditingSlide({
                      ...editingSlide,
                      title: e.target.value.slice(0, 50)
                    })}
                    className="w-full bg-background px-4 py-2 rounded"
                    required
                    maxLength={50}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Subtitle (max 150 characters)
                  </label>
                  <textarea
                    value={editingSlide.subtitle || ''}
                    onChange={(e) => setEditingSlide({
                      ...editingSlide,
                      subtitle: e.target.value.slice(0, 150)
                    })}
                    className="w-full bg-background px-4 py-2 rounded resize-none h-20"
                    maxLength={150}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">CTA Text</label>
                    <input
                      type="text"
                      value={editingSlide.cta_text || ''}
                      onChange={(e) => setEditingSlide({
                        ...editingSlide,
                        cta_text: e.target.value
                      })}
                      className="w-full bg-background px-4 py-2 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">CTA URL</label>
                    <input
                      type="text"
                      value={editingSlide.cta_url || ''}
                      onChange={(e) => setEditingSlide({
                        ...editingSlide,
                        cta_url: e.target.value
                      })}
                      className="w-full bg-background px-4 py-2 rounded"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Start Date
                    </label>
                    <input
                      type="datetime-local"
                      value={editingSlide.start_date?.split('.')[0] || ''}
                      onChange={(e) => setEditingSlide({
                        ...editingSlide,
                        start_date: e.target.value ? new Date(e.target.value).toISOString() : undefined
                      })}
                      className="w-full bg-background px-4 py-2 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      End Date
                    </label>
                    <input
                      type="datetime-local"
                      value={editingSlide.end_date?.split('.')[0] || ''}
                      onChange={(e) => setEditingSlide({
                        ...editingSlide,
                        end_date: e.target.value ? new Date(e.target.value).toISOString() : undefined
                      })}
                      className="w-full bg-background px-4 py-2 rounded"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={editingSlide.is_active}
                    onChange={(e) => setEditingSlide({
                      ...editingSlide,
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
                  Save Slide
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
