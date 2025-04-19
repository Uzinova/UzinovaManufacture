import React, { useEffect } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Calendar, Clock, FileText } from 'lucide-react';
import { Navbar } from '../components/Navbar';

export default function OfferSuccessPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get the data from location state
  const offerData = location.state?.offerData;
  
  // If no offer data and no id, redirect to home
  useEffect(() => {
    if (!offerData && !id) {
      navigate('/');
    }
  }, [offerData, id, navigate]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      
      <div className="flex-1 pt-24 pb-12 px-4 max-w-3xl mx-auto w-full">
        <div className="bg-accent rounded-lg overflow-hidden">
          <div className="bg-primary/10 py-8 px-6 text-center border-b border-primary/20">
            <div className="mb-4 inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Teklif Talebiniz Alındı!</h1>
            <p className="text-gray-400">Talebinizi en kısa sürede değerlendireceğiz.</p>
          </div>
          
          <div className="p-6">
            <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center">
              <div className="flex items-center mb-4 md:mb-0">
                <FileText className="h-5 w-5 text-primary mr-2" />
                <span className="font-bold">Teklif ID:</span>
                <span className="ml-2">{id || offerData?.id || "N/A"}</span>
              </div>
              
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-primary mr-2" />
                <span>
                  {offerData?.createdAt ? formatDate(offerData.createdAt) : "Şimdi"}
                </span>
              </div>
            </div>
            
            <div className="bg-background p-6 rounded-lg mb-6">
              <h2 className="text-lg font-bold mb-4">Sonraki Adımlar</h2>
              <ul className="space-y-4">
                <li className="flex">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-primary-foreground text-xs font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Teklifiniz İnceleniyor</p>
                    <p className="text-gray-400 text-sm">Ekibimiz teklifinizi inceleyecek ve detaylandıracak.</p>
                  </div>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-primary-foreground text-xs font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-medium">İletişime Geçeceğiz</p>
                    <p className="text-gray-400 text-sm">Belirttiğiniz iletişim bilgileri üzerinden sizinle iletişime geçeceğiz.</p>
                  </div>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-primary-foreground text-xs font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-medium">Fiyat ve Teslimat Bilgisi</p>
                    <p className="text-gray-400 text-sm">Detaylı fiyat ve teslimat bilgilerini paylaşacağız.</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="bg-background p-6 rounded-lg mb-6">
              <h2 className="text-lg font-bold mb-4">Ortalama Yanıt Süresi</h2>
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-primary mr-2" />
                <p>24 saat içinde yanıt vereceğiz</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Link
                to="/"
                className="flex items-center justify-center bg-accent/50 text-foreground px-6 py-3 rounded hover:bg-accent/70 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Ana Sayfaya Dön
              </Link>
              
              <Link
                to="/products"
                className="flex items-center justify-center bg-primary text-primary-foreground px-6 py-3 rounded hover:bg-primary/90 transition-colors"
              >
                Alışverişe Devam Et
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
