import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, LogOut, User, Settings, Printer as Printer3D, Search, Factory, ChevronDown, Radio, MessageSquare, Rocket, Cpu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { db } from '../lib/firebase';
import type { Product } from '../types/product';
import logo from '../logo.png';

interface Category {
  id: string;
  name: string;
  subcategories: string[];
  path?: string[];
}

interface NavbarProps {
  transparent?: boolean;
}

export function Navbar({ transparent = false }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [servicesMenuOpen, setServicesMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { currentUser, logout, isAdmin } = useAuth();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const magazaRef = useRef<HTMLDivElement>(null);
  
  // Separate state for mobile expanded categories
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);

  // Add debug logging
  useEffect(() => {
    console.log('Navbar State:', {
      servicesMenuOpen,
      userMenuOpen,
      mobileMenuOpen,
      showSearchDropdown
    });
  }, [servicesMenuOpen, userMenuOpen, mobileMenuOpen, showSearchDropdown]);

  // Handle click outside for all dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Check if the click is on a dropdown button
      const isDropdownButton = target.closest('button')?.classList.contains('nav-link') || 
                              target.closest('button')?.classList.contains('flex');
      
      if (isDropdownButton) {
        return; // Don't close if clicking the button
      }

      // Check if the click is inside any dropdown
      const isInsideDropdown = target.closest('.dropdown-menu') || 
                              target.closest('a')?.classList.contains('flex');
      
      if (isInsideDropdown) {
        return; // Don't close if clicking inside dropdown
      }

      // Close all dropdowns if clicking outside
      setShowSearchDropdown(false);
      setUserMenuOpen(false);
      setServicesMenuOpen(false);
      
      // Don't reset activeDropdown in mobile view to preserve category navigation
      if (window.innerWidth > 768) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const categoriesQuery = db.query(
        db.collection('categories')
      );
      
      const querySnapshot = await db.getDocs(categoriesQuery);
      const fetchedCategories = querySnapshot.docs.map(doc => {
        const data = doc.data() as {
          name: string;
          subcategories?: string[];
          path?: string[];
        };
        
        console.log(`Category ${doc.id} raw data:`, data);
        
        const subcategories = data.subcategories;
        console.log(`Category ${doc.id} subcategories:`, subcategories);
        
        return {
          id: doc.id,
          name: data.name,
          subcategories: Array.isArray(subcategories) ? subcategories : [],
          path: Array.isArray(data.path) ? data.path : [data.name]
        } as Category;
      });

      console.log('Fetched categories with parsed data:', fetchedCategories);
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Debug the category state
  useEffect(() => {
    console.log('Categories state:', categories);
  }, [categories]);

  // Debug activeDropdown
  useEffect(() => {
    console.log('Active dropdown:', activeDropdown);
  }, [activeDropdown]);

  const handleLogout = async () => {
    try {
      await logout();
      setUserMenuOpen(false);
      setServicesMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleSearchInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length >= 2) {
      try {
        const productsQuery = db.query(
          db.collection('products'),
          db.where('name', '>=', query),
          db.where('name', '<=', query + '\uf8ff')
        );
        
        const snapshot = await db.getDocs(productsQuery);
        const results = snapshot.docs.map(doc => {
          const data = doc.data() as Omit<Product, 'id'>;
          return {
            id: doc.id,
            ...data
          } as Product;
        });
        
        setSearchResults(results);
        setShowSearchDropdown(true);
      } catch (error) {
        console.error('Error searching products:', error);
        setSearchResults([]);
        setShowSearchDropdown(false);
      }
    } else {
      setSearchResults([]);
      setShowSearchDropdown(false);
    }
  };

  const handleProductClick = (productId: string) => {
    setShowSearchDropdown(false);
    setSearchQuery('');
    navigate(`/products/${productId}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchDropdown(false);
    }
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-50 ${transparent ? 'bg-transparent' : 'bg-background/95 backdrop-blur-sm'} overflow-visible`}>
        <div className="max-w-[1920px] mx-auto px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 overflow-visible">
          <div className="flex items-center justify-between h-14 xs:h-16 sm:h-16 md:h-18 lg:h-20 w-full overflow-visible">
            {/* Logo */}
            <Link to="/" className="flex items-center flex-shrink-0">
              <img 
                src={logo} 
                alt="Uzinovas Logo" 
                className="h-40 xs:h-45 sm:h-50 md:h-55 lg:h-60 xl:h-65 w-auto max-h-70" 
              />
            </Link>

            {/* Desktop Search Bar - hidden below 1280px (xl) */}
            <div className="relative hidden xl:block flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-2 md:mx-4" ref={searchRef}>
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Ürün ara..."
                  value={searchQuery}
                  onChange={handleSearchInput}
                  onFocus={() => searchQuery.length >= 2 && setShowSearchDropdown(true)}
                  className="w-full bg-[#1a1a1a] border border-orange-500/20 rounded-lg px-3 py-2 pr-10 text-xs xs:text-sm sm:text-base md:text-lg focus:outline-none focus:border-orange-500 transition-colors text-white/90 placeholder-white/50"
                />
                <button 
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-500 hover:text-orange-400 transition-colors"
                >
                  <Search className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6" />
                </button>
              </form>
              {showSearchDropdown && searchResults.length > 0 && (
                <div className="absolute w-full mt-2 max-h-80 bg-[#1a1a1a] rounded-lg shadow-xl py-1 z-[9999] border border-orange-500/20 overflow-hidden">
                  {searchResults.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleProductClick(product.id)}
                      className="w-full px-3 py-2 text-left hover:bg-orange-500/10 flex items-center space-x-3"
                    >
                      {product.images && product.images.length > 0 && (
                        <img 
                          src={product.images[product.mainImageIndex || 0]} 
                          alt={product.name}
                          className="w-8 h-8 md:w-10 md:h-10 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs md:text-sm font-medium truncate text-white/90">{product.name}</p>
                        <p className="text-xs text-orange-500">{product.price} ₺</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Navigation - hidden below 1280px (xl) */}
            <div className="hidden xl:flex items-center space-x-4 lg:space-x-8 ml-auto overflow-visible scrollbar-thin scrollbar-thumb-orange-500/30 scrollbar-track-transparent max-w-full">
              {/* Mağaza Dropdown */}
              <div className="relative inline-block" ref={magazaRef}>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdown(activeDropdown === 'magaza' ? null : 'magaza');
                  }}
                  className="flex items-center space-x-1.5 text-sm text-white/90 hover:text-orange-500 transition-colors py-2 px-1"
                >
                  <Rocket className="h-5 w-5 mr-1 text-orange-500 transform hover:scale-110 transition-transform duration-300 hover:rotate-12" />
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${activeDropdown === 'magaza' ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Main Dropdown Menu */}
                {activeDropdown === 'magaza' && categories.length > 0 && (
                  <div className="origin-top-right right-0 mt-2 w-56 rounded-lg shadow-xl bg-black py-1 z-[9999] border border-orange-500 dropdown-menu"
                  style={{
                    position: 'fixed',
                    top: (magazaRef.current?.getBoundingClientRect().bottom || 0) + 4,
                    left: magazaRef.current?.getBoundingClientRect().left || 0
                  }}>
                    {/* Hepsi (All) option */}
                    <div className="relative group">
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/products');
                          setActiveDropdown(null);
                        }}
                        className="flex items-center justify-between w-full px-3 py-1.5 text-sm text-orange-500 hover:bg-orange-500/20 transition-colors cursor-pointer font-medium"
                      >
                        <span>Hepsi</span>
                      </div>
                    </div>
                    
                    {/* Divider */}
                    <div className="border-t border-orange-500/20 my-1"></div>
                  
                    {categories.filter(cat => !cat.path || cat.path.length === 1).map((category) => (
                      <div key={category.id} className="relative group">
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Category clicked:', category.name, 'with subcategories:', category.subcategories);
                            // Navigate to category page
                            navigate(`/products?category=${encodeURIComponent(category.name)}`);
                            setActiveDropdown(null);
                          }}
                          className="flex items-center justify-between w-full px-3 py-1.5 text-sm text-orange-500 hover:bg-orange-500/20 transition-colors cursor-pointer"
                        >
                          <span>{category.name}</span>
                        </div>
                        
                        {/* Show subcategories inline if available */}
                        {Array.isArray(category.subcategories) && category.subcategories.length > 0 && (
                          <div className="pl-4 bg-black/50">
                            {category.subcategories.map((subcat, index) => (
                              <div
                                key={`${category.id}-${index}`}
                                onClick={() => {
                                  console.log('Subcategory clicked:', subcat);
                                  navigate(`/products?category=${encodeURIComponent(category.name)}&subcategory=${encodeURIComponent(subcat)}`);
                                  setActiveDropdown(null);
                                }}
                                className="block px-3 py-1.5 text-sm text-orange-500 hover:bg-orange-500/20 transition-colors cursor-pointer"
                              >
                                {subcat}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Link to="/services/composite-manufacturing" className="nav-link flex items-center text-sm text-white/90 hover:text-orange-500 transition-colors">
                <Factory className="h-4 w-4 mr-1.5" />
                Kompozit Üretim
              </Link>

              <Link to="/ground-station" className="nav-link flex items-center text-sm text-white/90 hover:text-orange-500 transition-colors">
                <Radio className="h-4 w-4 mr-1.5" />
                Yer İstasyonu
              </Link>

              <Link to="/flight-control" className="nav-link flex items-center text-sm text-white/90 hover:text-orange-500 transition-colors">
                <Cpu className="h-4 w-4 mr-1.5" />
                Uçuş Kontrol
              </Link>

              <Link to="/3d-model" className="nav-link flex items-center text-sm text-white/90 hover:text-orange-500 transition-colors">
                <Printer3D className="h-4 w-4 mr-1.5" />
                3D Model
              </Link>

              <Link to="/contact" className="nav-link flex items-center text-sm text-white/90 hover:text-orange-500 transition-colors">
                <MessageSquare className="h-4 w-4 mr-1.5" />
                İletişim
              </Link>

              {/* User Menu */}
              {currentUser ? (
                <div className="relative inline-block" ref={userMenuRef}>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setUserMenuOpen(prev => !prev);
                      setServicesMenuOpen(false);
                    }}
                    className="flex items-center text-white/90 hover:text-orange-500 transition-colors"
                  >
                    <User className="h-5 w-5 mr-1.5" />
                    <span className="text-sm">{currentUser.email?.split('@')[0]}</span>
                  </button>
                  
                  {userMenuOpen && (
                    <div 
                      className="fixed w-40 rounded-lg shadow-xl bg-black py-1 z-[9999] border border-orange-500 dropdown-menu"
                      style={{
                        top: (userMenuRef.current?.getBoundingClientRect().bottom || 0) + 4,
                        right: window.innerWidth - (userMenuRef.current?.getBoundingClientRect().right || 0)
                      }}
                    >
                      <div className="py-1">
                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center w-full px-3 py-1.5 text-sm text-orange-500 hover:bg-orange-500/20 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setUserMenuOpen(false);
                            }}
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Admin Panel
                          </Link>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLogout();
                          }}
                          className="flex items-center w-full px-3 py-1.5 text-sm text-orange-500 hover:bg-orange-500/20 transition-colors"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Çıkış Yap
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link 
                  to="/login" 
                  className="text-white/90 hover:text-orange-500 transition-colors"
                >
                  Giriş Yap
                </Link>
              )}
              
              {/* Cart Button */}
              <div className="relative h-full flex items-center py-1">
                <Link to="/cart" className="block">
                  <div className="bg-orange-500 text-white p-1.5 rounded-lg hover:bg-orange-600 transition-colors">
                    <ShoppingCart className="h-4 w-4" />
                  </div>
                  {getTotalItems() > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                      {getTotalItems()}
                    </div>
                  )}
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button and Cart - visible <1280px (xl) */}
            <div className="flex xl:hidden items-center ml-auto space-x-2 overflow-visible">
              <div className="relative h-full flex items-center py-1">
                <Link to="/cart" className="block">
                  <div className="bg-orange-500 text-white p-2.5 rounded-lg hover:bg-orange-600 transition-colors">
                    <ShoppingCart className="h-6 w-6" />
                  </div>
                  {getTotalItems() > 0 && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {getTotalItems()}
                    </div>
                  )}
                </Link>
              </div>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu - Full Screen Overlay, improved for <=800px */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black z-40 md:hidden" style={{ marginTop: '56px' }}>
          <div className="h-full overflow-y-auto pb-20 px-2 sm:px-4">
            {/* Mobile Search Bar - always at top in mobile menu */}
            <div className="p-3 sticky top-0 bg-black border-b border-orange-500/20">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Ürün ara..."
                  value={searchQuery}
                  onChange={handleSearchInput}
                  className="w-full bg-[#1a1a1a] border border-orange-500/30 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors text-white/90 placeholder-white/50"
                />
                <button 
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-500"
                >
                  <Search className="h-5 w-5" />
                </button>
              </form>
            </div>
            
            <div className="px-4 py-6 space-y-6">
              {/* Mağaza Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-orange-500/10 px-4 py-3 rounded-lg border border-orange-500/20">
                  <div className="flex items-center">
                    <Rocket className="h-6 w-6 mr-2 text-orange-500 transform hover:scale-110 transition-transform duration-300 hover:rotate-12" />
                    <span className="text-lg font-medium text-white">Ürünler</span>
                  </div>
                  <button
                    onClick={() => {
                      setActiveDropdown(activeDropdown === 'magaza' ? null : 'magaza');
                      setExpandedMobileCategory(null);
                    }}
                    className="text-orange-500"
                  >
                    <ChevronDown className={`h-6 w-6 transition-transform duration-300 ${
                      activeDropdown === 'magaza' ? 'rotate-180' : ''
                    }`} />
                  </button>
                </div>
                
                {/* Categories List */}
                {activeDropdown === 'magaza' && (
                  <div className="space-y-3 pl-4 pt-2">
                    {/* All Products Link */}
                    <Link
                      to="/products"
                      className="block py-3 px-4 bg-orange-500/5 hover:bg-orange-500/10 rounded-lg text-white text-lg font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Tüm Ürünler
                    </Link>
                    
                    {/* Categories */}
                    {categories.filter(cat => !cat.path || cat.path.length === 1).map((category) => (
                      <div key={category.id} className="space-y-2">
                        <div 
                          className={`flex items-center justify-between py-3 px-4 rounded-lg text-lg ${
                            expandedMobileCategory === category.id 
                              ? 'bg-orange-500/20 text-white' 
                              : 'bg-[#1a1a1a] text-white/90'
                          }`}
                        >
                          <button
                            onClick={() => {
                              if (!category.subcategories?.length) {
                                navigate(`/products?category=${encodeURIComponent(category.name)}`);
                                setMobileMenuOpen(false);
                              } else {
                                setExpandedMobileCategory(
                                  expandedMobileCategory === category.id ? null : category.id
                                );
                              }
                            }}
                            className="text-left flex-1"
                          >
                            {category.name}
                          </button>
                          
                          {category.subcategories?.length > 0 && (
                            <button
                              onClick={() => {
                                setExpandedMobileCategory(
                                  expandedMobileCategory === category.id ? null : category.id
                                );
                              }}
                              className="text-orange-500"
                            >
                              <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${
                                expandedMobileCategory === category.id ? 'rotate-180' : ''
                              }`} />
                            </button>
                          )}
                        </div>
                        
                        {/* Subcategories */}
                        {expandedMobileCategory === category.id && category.subcategories && category.subcategories.length > 0 && (
                          <div className="pl-4 space-y-2">
                            <Link
                              to={`/products?category=${encodeURIComponent(category.name)}`}
                              className="block py-2 px-3 bg-[#1a1a1a]/50 rounded-lg text-white/80 hover:text-white"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {category.name} - Tümü
                            </Link>
                            
                            {category.subcategories.map((subcat, index) => (
                              <Link
                                key={`${category.id}-${index}`}
                                to={`/products?category=${encodeURIComponent(category.name)}&subcategory=${encodeURIComponent(subcat)}`}
                                className="block py-2 px-3 bg-[#1a1a1a]/50 rounded-lg text-white/80 hover:text-white"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                {subcat}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Main Navigation Links */}
              <div className="space-y-3">
                <Link 
                  to="/services/composite-manufacturing"
                  className="flex items-center gap-3 px-4 py-3 bg-orange-500/10 rounded-lg border border-orange-500/20 hover:bg-orange-500/20 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Factory className="h-6 w-6 text-orange-500" />
                  <span className="text-lg font-medium text-white">Kompozit Üretim</span>
                </Link>
                
                <Link 
                  to="/ground-station"
                  className="flex items-center gap-3 px-4 py-3 bg-orange-500/10 rounded-lg border border-orange-500/20 hover:bg-orange-500/20 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Radio className="h-6 w-6 text-orange-500" />
                  <span className="text-lg font-medium text-white">Yer İstasyonu</span>
                </Link>
                
                <Link 
                  to="/flight-control"
                  className="flex items-center gap-3 px-4 py-3 bg-orange-500/10 rounded-lg border border-orange-500/20 hover:bg-orange-500/20 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Cpu className="h-6 w-6 text-orange-500" />
                  <span className="text-lg font-medium text-white">Uçuş Kontrol</span>
                </Link>
                
                <Link 
                  to="/3d-model"
                  className="flex items-center gap-3 px-4 py-3 bg-orange-500/10 rounded-lg border border-orange-500/20 hover:bg-orange-500/20 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Printer3D className="h-6 w-6 text-orange-500" />
                  <span className="text-lg font-medium text-white">3D Model</span>
                </Link>
                
                <Link 
                  to="/contact"
                  className="flex items-center gap-3 px-4 py-3 bg-orange-500/10 rounded-lg border border-orange-500/20 hover:bg-orange-500/20 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <MessageSquare className="h-6 w-6 text-orange-500" />
                  <span className="text-lg font-medium text-white">İletişim</span>
                </Link>
              </div>
              
              {/* User Account Section */}
              <div className="pt-4 border-t border-orange-500/20 space-y-3">
                {currentUser ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 px-4 py-3 bg-[#1a1a1a] rounded-lg">
                      <User className="h-6 w-6 text-orange-500" />
                      <span className="text-lg font-medium text-white">{currentUser.email?.split('@')[0]}</span>
                    </div>
                    
                    {isAdmin && (
                      <Link 
                        to="/admin"
                        className="flex items-center gap-3 px-4 py-3 bg-orange-500/5 rounded-lg hover:bg-orange-500/10 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Settings className="h-6 w-6 text-orange-500" />
                        <span className="text-lg font-medium text-white">Admin Panel</span>
                      </Link>
                    )}
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors text-left"
                    >
                      <LogOut className="h-6 w-6 text-red-500" />
                      <span className="text-lg font-medium text-red-400">Çıkış Yap</span>
                    </button>
                  </div>
                ) : (
                  <Link 
                    to="/login"
                    className="flex items-center gap-3 px-4 py-3 bg-orange-500/20 rounded-lg hover:bg-orange-500/30 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-6 w-6 text-orange-500" />
                    <span className="text-lg font-medium text-white">Giriş Yap</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
