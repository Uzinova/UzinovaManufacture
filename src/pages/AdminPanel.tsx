import React, { useState } from 'react';
import { Rocket, ChevronLeft, LayoutDashboard, Newspaper, Image, ShoppingBag, Tag, User, Settings, LogOut, MessageSquare } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { HeroCarouselManager } from '../components/admin/HeroCarouselManager';
import { CarouselManager } from '../components/admin/CarouselManager';
import { NewsManager } from '../components/admin/NewsManager';
import { ProductLabelsManager } from '../components/admin/ProductLabelsManager';
import { ProductManager } from '../components/admin/ProductManager';
import { OfferManager } from '../components/admin/OfferManager';
import { useAuth } from '../contexts/AuthContext';
import { CategoryManager } from '../components/admin/CatagoryManager';
type AdminTabType = 'dashboard' | 'hero-carousel' | 'carousel' | 'news' | 'products' | 'labels' | 'users' | 'settings' | 'offers' | 'categories';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<AdminTabType>('hero-carousel');
  const navigate = useNavigate();
  const { currentUser, logout, isAdmin } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Render unauthorized access message if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
        <div className="bg-accent p-8 rounded-lg max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4">Yetkisiz Erişim</h2>
          <p className="text-gray-400 mb-6">Bu sayfaya erişim yetkiniz bulunmamaktadır. Yönetici paneline erişmek için yetkili bir hesapla giriş yapmanız gerekmektedir.</p>
          {currentUser ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-400">
                <span className="font-bold">{currentUser.email}</span> hesabı yönetici yetkisine sahip değil.
              </p>
              <div className="flex space-x-4 justify-center">
                <button
                  onClick={handleLogout}
                  className="bg-accent/50 text-foreground px-4 py-2 rounded hover:bg-accent/70 transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-2 inline-block" />
                  Çıkış Yap
                </button>
                <Link 
                  to="/"
                  className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-colors"
                >
                  Ana Sayfaya Dön
                </Link>
              </div>
            </div>
          ) : (
            <Link 
              to="/login"
              className="bg-primary text-primary-foreground px-6 py-2 rounded hover:bg-primary/90 transition-colors inline-block"
            >
              Giriş Yap
            </Link>
          )}
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab />;
      case 'hero-carousel':
        return <HeroCarouselManager />;
      case 'carousel':
        return <CarouselManager />;
      case 'news':
        return <NewsManager />;
      case 'products':
        return <ProductManager />;
      case 'labels':
        return <ProductLabelsManager />;
      case 'categories': // Add this case for the Categories tab
        return <CategoryManager />;
      case 'offers':
        return <OfferManager />;
      case 'users':
        return <div>User Management</div>;
      case 'settings':
        return <div>Settings</div>;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <div className="w-64 bg-accent flex flex-col h-screen sticky top-0">
        <div className="p-4 border-b border-accent/50">
          <div className="flex items-center">
            <Rocket className="h-6 w-6 text-primary mr-2" />
            <h1 className="text-xl font-bold">Admin Panel</h1>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center p-2 rounded-md transition-colors ${
              activeTab === 'dashboard' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent/50'
            }`}
          >
            <LayoutDashboard className="h-5 w-5 mr-3" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('hero-carousel')}
            className={`w-full flex items-center p-2 rounded-md transition-colors ${
              activeTab === 'hero-carousel' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent/50'
            }`}
          >
            <Image className="h-5 w-5 mr-3" />
            Hero Carousel
          </button>
          <button
            onClick={() => setActiveTab('carousel')}
            className={`w-full flex items-center p-2 rounded-md transition-colors ${
              activeTab === 'carousel' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent/50'
            }`}
          >
            <Image className="h-5 w-5 mr-3" />
            Carousel Images
          </button>
          <button
            onClick={() => setActiveTab('news')}
            className={`w-full flex items-center p-2 rounded-md transition-colors ${
              activeTab === 'news' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent/50'
            }`}
          >
            <Newspaper className="h-5 w-5 mr-3" />
            News
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center p-2 rounded-md transition-colors ${
              activeTab === 'products' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent/50'
            }`}
          >
            <ShoppingBag className="h-5 w-5 mr-3" />
            Products
          </button>
          <button
            onClick={() => setActiveTab('labels')}
            className={`w-full flex items-center p-2 rounded-md transition-colors ${
              activeTab === 'labels' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent/50'
            }`}
          >
            <Tag className="h-5 w-5 mr-3" />
            Labels
          </button>
          <button
            onClick={() => setActiveTab('offers')}
            className={`w-full flex items-center p-2 rounded-md transition-colors ${
              activeTab === 'offers' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent/50'
            }`}
          >
            <MessageSquare className="h-5 w-5 mr-3" />
            Teklif İstekleri
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center p-2 rounded-md transition-colors ${
              activeTab === 'users' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent/50'
            }`}
          >
            <User className="h-5 w-5 mr-3" />
            Users
          </button>
         
          <button
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center p-2 rounded-md transition-colors ${
              activeTab === 'categories' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent/50'
            }`}
          >
 <MessageSquare className="h-5 w-5 mr-3" />
 Catagory Manager


          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center p-2 rounded-md transition-colors ${
              activeTab === 'settings' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent/50'
            }`}
          >
            <Settings className="h-5 w-5 mr-3" />
            Settings
          </button>
        </nav>
        <div className="p-4 border-t border-accent/50">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center p-2 rounded-md hover:bg-accent/50 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 mr-2" />
            Back to Site
          </button>
          {currentUser && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center p-2 rounded-md hover:bg-accent/50 transition-colors text-red-500 mt-2"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Çıkış Yap
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        {renderTabContent()}
      </div>
    </div>
  );
}

// Dashboard Tab Content
function DashboardTab() {
  const { currentUser } = useAuth();
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      
      <div className="bg-accent rounded-lg p-6 mb-6">
        <h3 className="font-bold mb-2">Admin Information</h3>
        <p className="text-gray-400">Logged in as: <span className="text-primary">{currentUser?.email}</span></p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-accent rounded-lg p-6">
          <h3 className="font-bold mb-2">Total Products</h3>
          <p className="text-3xl text-primary">24</p>
        </div>
        <div className="bg-accent rounded-lg p-6">
          <h3 className="font-bold mb-2">News Articles</h3>
          <p className="text-3xl text-primary">8</p>
        </div>
        <div className="bg-accent rounded-lg p-6">
          <h3 className="font-bold mb-2">Active Slides</h3>
          <p className="text-3xl text-primary">3</p>
        </div>
      </div>
      <div className="bg-accent rounded-lg p-6">
        <h3 className="font-bold mb-4">Recent Activity</h3>
        <div className="space-y-2">
          <div className="p-3 bg-background rounded-md">
            <p className="text-sm">New hero slide created</p>
            <p className="text-xs text-gray-400">2 hours ago</p>
          </div>
          <div className="p-3 bg-background rounded-md">
            <p className="text-sm">News article published</p>
            <p className="text-xs text-gray-400">3 hours ago</p>
          </div>
          <div className="p-3 bg-background rounded-md">
            <p className="text-sm">Product updated</p>
            <p className="text-xs text-gray-400">Yesterday</p>
          </div>
        </div>
      </div>
    </div>
  );
}
