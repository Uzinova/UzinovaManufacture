import React, { useState, useEffect } from 'react';
import { Clock, X, Check, Mail, Phone, User, MessageSquare, Tag, Calendar, MapPin, Building, Globe } from 'lucide-react';
import { db } from '../../lib/firebase';

interface OfferItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  description?: string;
  image?: string;
}

interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  message: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

interface Offer {
  id: string;
  userId: string;
  userEmail: string;
  contactInfo: ContactInfo;
  items: OfferItem[];
  totalPrice: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export function OfferManager() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const offersQuery = db.query(
        db.collection('offers'),
        db.orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await db.getDocs(offersQuery);
      const fetchedOffers = querySnapshot.docs.map(doc => {
        const data = doc.data() as {
          userId: string;
          userEmail: string;
          contactInfo: ContactInfo;
          items: OfferItem[];
          totalPrice: number;
          status: 'pending' | 'accepted' | 'rejected';
          createdAt: string;
        };
        
        return {
          id: doc.id,
          ...data
        };
      });
      
      setOffers(fetchedOffers);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching offers:', error);
      setIsLoading(false);
    }
  };

  const updateOfferStatus = async (id: string, status: 'accepted' | 'rejected') => {
    try {
      await db.updateDoc(db.doc(db, 'offers', id), {
        status,
        updatedAt: new Date().toISOString()
      });
      
      // Update local state
      setOffers(prevOffers => 
        prevOffers.map(offer => 
          offer.id === id ? { ...offer, status } : offer
        )
      );
      
      if (selectedOffer?.id === id) {
        setSelectedOffer({ ...selectedOffer, status });
      }
    } catch (error) {
      console.error('Error updating offer status:', error);
    }
  };

  const filteredOffers = offers.filter(offer => {
    if (filter === 'all') return true;
    return offer.status === filter;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
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
        <h2 className="text-2xl font-bold">Teklif İstekleri</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-accent'}`}
          >
            Tümü
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded ${filter === 'pending' ? 'bg-primary text-primary-foreground' : 'bg-accent'}`}
          >
            Bekleyen
          </button>
          <button
            onClick={() => setFilter('accepted')}
            className={`px-3 py-1 rounded ${filter === 'accepted' ? 'bg-primary text-primary-foreground' : 'bg-accent'}`}
          >
            Kabul Edilen
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-3 py-1 rounded ${filter === 'rejected' ? 'bg-primary text-primary-foreground' : 'bg-accent'}`}
          >
            Reddedilen
          </button>
        </div>
      </div>

      {offers.length === 0 ? (
        <div className="bg-accent rounded-lg p-8 text-center">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Henüz teklif isteği bulunmamaktadır</h3>
          <p className="text-gray-400">Müşteriler teklif istedikçe burada görüntülenecektir.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="bg-accent rounded-lg overflow-hidden">
              <div className="p-4 border-b border-background">
                <h3 className="font-bold">Teklif Listesi</h3>
              </div>
              <div className="divide-y divide-background max-h-[600px] overflow-y-auto">
                {filteredOffers.length === 0 ? (
                  <div className="p-4 text-center text-gray-400">
                    Bu filtre için teklif bulunamadı
                  </div>
                ) : (
                  filteredOffers.map(offer => (
                    <button
                      key={offer.id}
                      className={`w-full text-left p-4 hover:bg-background/50 transition-colors ${selectedOffer?.id === offer.id ? 'bg-background/50' : ''}`}
                      onClick={() => setSelectedOffer(offer)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold">{offer.contactInfo.name}</p>
                          <p className="text-sm text-gray-400">{offer.userEmail}</p>
                        </div>
                        <div>
                          <span className={`text-sm px-2 py-1 rounded ${
                            offer.status === 'pending' ? 'bg-blue-500/20 text-blue-400' :
                            offer.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {offer.status === 'pending' ? 'Bekliyor' :
                             offer.status === 'accepted' ? 'Kabul Edildi' : 'Reddedildi'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center mt-2 text-sm text-gray-400">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(offer.createdAt)}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
          
          <div className="md:col-span-2">
            {selectedOffer ? (
              <div className="bg-accent rounded-lg p-6">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-bold">Teklif Detayı</h3>
                  <span className={`text-sm px-2 py-1 rounded ${
                    selectedOffer.status === 'pending' ? 'bg-blue-500/20 text-blue-400' :
                    selectedOffer.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {selectedOffer.status === 'pending' ? 'Bekliyor' :
                     selectedOffer.status === 'accepted' ? 'Kabul Edildi' : 'Reddedildi'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <h4 className="font-bold text-sm uppercase text-gray-400">İletişim Bilgileri</h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-primary mr-2" />
                        <span>{selectedOffer.contactInfo.name}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-primary mr-2" />
                        <span>{selectedOffer.contactInfo.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-primary mr-2" />
                        <span>{selectedOffer.contactInfo.phone}</span>
                      </div>
                      {selectedOffer.contactInfo.message && (
                        <div className="flex items-start">
                          <MessageSquare className="h-4 w-4 text-primary mr-2 mt-1" />
                          <p className="text-sm">{selectedOffer.contactInfo.message}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-bold text-sm uppercase text-gray-400">Sipariş Bilgileri</h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 text-primary mr-2" />
                        <span>Toplam Tutar: <span className="font-bold">
                          {selectedOffer.totalPrice.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                        </span></span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-primary mr-2" />
                        <span>Teklif Tarihi: {formatDate(selectedOffer.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="mb-6">
                  <h4 className="font-bold text-sm uppercase text-gray-400 mb-3">Adres Bilgileri</h4>
                  <div className="bg-background p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 text-primary mr-2 mt-1" />
                        <div>
                          <p className="text-sm font-medium text-gray-400">Adres</p>
                          <p>{selectedOffer.contactInfo.address?.street || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Building className="h-4 w-4 text-primary mr-2 mt-1" />
                        <div>
                          <p className="text-sm font-medium text-gray-400">Şehir/İlçe</p>
                          <p>
                            {selectedOffer.contactInfo.address?.city || 'N/A'}
                            {selectedOffer.contactInfo.address?.state && `, ${selectedOffer.contactInfo.address.state}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Tag className="h-4 w-4 text-primary mr-2 mt-1" />
                        <div>
                          <p className="text-sm font-medium text-gray-400">Posta Kodu</p>
                          <p>{selectedOffer.contactInfo.address?.postalCode || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Globe className="h-4 w-4 text-primary mr-2 mt-1" />
                        <div>
                          <p className="text-sm font-medium text-gray-400">Ülke</p>
                          <p>{selectedOffer.contactInfo.address?.country || 'Türkiye'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-bold text-sm uppercase text-gray-400 mb-3">Ürünler</h4>
                  <div className="bg-background rounded-lg overflow-hidden">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-accent">
                          <th className="p-3 text-left">Ürün</th>
                          <th className="p-3 text-left">Detaylar</th>
                          <th className="p-3 text-left">Fiyat</th>
                          <th className="p-3 text-left">Adet</th>
                          <th className="p-3 text-left">Toplam</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOffer.items.map((item, index) => (
                          <tr key={index} className="border-b border-accent">
                            <td className="p-3">
                              <div className="font-medium">{item.name}</div>
                              {item.image && (
                                <div className="mt-2 w-12 h-12 bg-background rounded overflow-hidden">
                                  <img 
                                    src={item.image} 
                                    alt={item.name}
                                    className="w-full h-full object-contain" 
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                </div>
                              )}
                            </td>
                            <td className="p-3">
                              {item.description ? (
                                <div className="text-sm text-gray-400">{item.description}</div>
                              ) : (
                                <div className="text-sm text-gray-500 italic">Detay yok</div>
                              )}
                            </td>
                            <td className="p-3">
                              {item.price === 0 && item.name.includes('Kompozit') ? (
                                <span className="text-blue-400 text-sm">Fiyatlandırılacak</span>
                              ) : (
                                item.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })
                              )}
                            </td>
                            <td className="p-3">{item.quantity}</td>
                            <td className="p-3">
                              {item.price === 0 && item.name.includes('Kompozit') ? (
                                <span className="text-blue-400 text-sm">Fiyatlandırılacak</span>
                              ) : (
                                (item.price * item.quantity).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {selectedOffer.items.some(item => item.name.includes('Kompozit') && item.price === 0) && (
                      <div className="p-3 bg-blue-500/10 text-blue-400 text-sm">
                        <strong>Not:</strong> Kompozit parçaların fiyatları özel olarak belirlenecektir. Siparişin onaylanması halinde müşteriye fiyat bilgisi iletilecektir.
                      </div>
                    )}
                  </div>
                </div>
                
                {selectedOffer.status === 'pending' && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => updateOfferStatus(selectedOffer.id, 'accepted')}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded flex items-center justify-center transition-colors"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Kabul Et
                    </button>
                    <button
                      onClick={() => updateOfferStatus(selectedOffer.id, 'rejected')}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded flex items-center justify-center transition-colors"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reddet
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-accent rounded-lg p-8 text-center h-full flex flex-col items-center justify-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Bir teklif seçin</h3>
                <p className="text-gray-400">Detayları görüntülemek için soldaki listeden bir teklif seçin.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
