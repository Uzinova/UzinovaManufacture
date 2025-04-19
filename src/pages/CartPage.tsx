import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Plus, Minus, X, Send, MapPin, Building, Mail, Phone, User, Globe } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/Navbar';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, submitOffer, clearCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Debug log for cart items
  useEffect(() => {
    console.log('Cart items in CartPage:', cartItems);
  }, [cartItems]);

  // Contact Info
  const [name, setName] = useState('');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  
  // Address Fields
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('Türkiye');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }
    
    if (!name || !email || !phone || !street || !city || !postalCode) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      const contactInfo = { 
        name, 
        email, 
        phone, 
        message,
        address: {
          street,
          city,
          state,
          postalCode,
          country
        }
      };
      
      const offerId = await submitOffer(contactInfo);
      
      // Navigate to success page
      navigate(`/offer-success/${offerId}`, { 
        state: { 
          offerData: {
            id: offerId,
            createdAt: new Date().toISOString()
          }
        }
      });
      
    } catch (error) {
      setError('Failed to submit offer. Please try again.');
      console.error('Error submitting offer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    console.log('CartPage - Cart items changed:', cartItems); // Debug log
  }, [cartItems]);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    console.log('CartPage - Updating quantity:', { itemId, newQuantity }); // Debug log
    updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId: string) => {
    console.log('CartPage - Removing item:', itemId); // Debug log
    removeFromCart(itemId);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      
      <div className="pt-20 pb-12 px-4 max-w-7xl mx-auto w-full flex-1">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center text-primary hover:text-primary/80 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Geri
            </button>
            <h1 className="text-2xl font-bold ml-4">Sepetim</h1>
          </div>
          
          {cartItems.length > 0 && (
            <button
              onClick={clearCart}
              className="text-red-500 hover:text-red-400 transition-colors text-sm"
            >
              Sepeti Temizle
            </button>
          )}
        </div>
        
        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Sepetiniz Boş</h2>
            <p className="text-gray-400 mb-4">Sepetinizde herhangi bir ürün bulunmamaktadır.</p>
            <Link 
              to="/products"
              className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors inline-block"
            >
              Alışverişe Başla
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-accent rounded-lg overflow-hidden">
                <div className="p-4 border-b border-background">
                  <h2 className="font-bold">Ürünler</h2>
                </div>
                
                <div className="divide-y divide-background">
                  {cartItems.map(item => (
                    <div key={item.id} className="p-4 flex items-center">
                      <div className="w-16 h-16 bg-background rounded overflow-hidden mr-4 flex items-center justify-center">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              console.error('Error loading image:', item.image);
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                parent.innerHTML = '';
                                const icon = document.createElement('div');
                                icon.className = 'w-full h-full flex items-center justify-center';
                                icon.innerHTML = '<svg class="h-6 w-6 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path></svg>';
                                parent.appendChild(icon);
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingCart className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        {item.description && (
                          <p className="text-sm text-gray-400">{item.description}</p>
                        )}
                        <p className="text-primary font-bold">
                          {item.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                          className="p-1 rounded-full bg-background hover:bg-primary/20 transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        
                        <span className="w-8 text-center">{item.quantity}</span>
                        
                        <button
                          onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                          className="p-1 rounded-full bg-background hover:bg-primary/20 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => handleRemoveItem(item.productId)}
                        className="ml-4 text-red-500 hover:text-red-400 transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="p-4 border-t border-background flex justify-between items-center">
                  <div>
                    <span className="text-gray-400">Toplam:</span>
                    <span className="text-xl font-bold ml-2">
                      {getTotalPrice().toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <div className="bg-accent rounded-lg p-4">
                <h2 className="font-bold mb-4">Teklif Formu</h2>
                
                <form onSubmit={handleSubmitOffer} className="space-y-6">
                  {error && (
                    <div className="bg-red-500/20 border border-red-500 rounded p-4">
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}
                  
                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-400 uppercase">İletişim Bilgileri</h3>
                    
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-1">Ad Soyad*</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="bg-background w-full pl-10 pr-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-1">E-posta*</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-background w-full pl-10 pr-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium mb-1">Telefon*</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="bg-background w-full pl-10 pr-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>
                    </div>
                  </div>
                    
                  {/* Address Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-400 uppercase">Adres Bilgileri</h3>
                    
                    <div>
                      <label htmlFor="street" className="block text-sm font-medium mb-1">Adres*</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          id="street"
                          type="text"
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          className="bg-background w-full pl-10 pr-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                          placeholder="Sokak adı, Bina no, Daire no"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="city" className="block text-sm font-medium mb-1">Şehir*</label>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            id="city"
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="bg-background w-full pl-10 pr-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="state" className="block text-sm font-medium mb-1">İlçe</label>
                        <input
                          id="state"
                          type="text"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          className="bg-background w-full px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="postalCode" className="block text-sm font-medium mb-1">Posta Kodu*</label>
                        <input
                          id="postalCode"
                          type="text"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          className="bg-background w-full px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="country" className="block text-sm font-medium mb-1">Ülke*</label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            id="country"
                            type="text"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="bg-background w-full pl-10 pr-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Additional Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-1">Ek Mesaj</label>
                    <textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="bg-background w-full px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary resize-none h-20"
                      placeholder="Eklemek istediğiniz detaylar..."
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full bg-primary text-primary-foreground py-2 rounded hover:bg-primary/90 transition-colors flex items-center justify-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmitting ? 'Gönderiliyor...' : 'Teklif İste'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
