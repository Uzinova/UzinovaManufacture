import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, LogOut, User, Settings, Printer as Printer3D, Search, Code, Factory, ChevronDown } from 'lucide-react';
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
    <nav className={`fixed top-0 left-0 w-full z-50 ${transparent ? 'bg-transparent' : 'bg-background/95 backdrop-blur-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Search */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center">
              <img src={logo} alt="Uzinovas Logo" className="h-7 w-auto" />
            </Link>

            <div className="relative hidden md:block" ref={searchRef}>
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Ürün ara..."
                  value={searchQuery}
                  onChange={handleSearchInput}
                  onFocus={() => searchQuery.length >= 2 && setShowSearchDropdown(true)}
                  className="bg-background/50 border border-primary/20 rounded-full px-4 py-1 pr-10 text-sm focus:outline-none focus:border-primary transition-colors w-64"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-primary/80 transition-colors"
                >
                  <Search className="h-4 w-4" />
                </button>
              </form>
              
              {showSearchDropdown && searchResults.length > 0 && (
                <div 
                  className="fixed w-64 max-h-80 bg-black rounded-lg shadow-xl py-1 z-[9999] border border-orange-500 dropdown-menu"
                  style={{
                    top: (searchRef.current?.getBoundingClientRect().bottom || 0) + 4,
                    left: searchRef.current?.getBoundingClientRect().left || 0
                  }}
                >
                  {searchResults.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleProductClick(product.id)}
                      className="w-full px-3 py-1.5 text-left hover:bg-orange-500/20 flex items-center space-x-2"
                    >
                      {product.images && product.images.length > 0 && (
                        <img 
                          src={product.images[product.mainImageIndex || 0]} 
                          alt={product.name}
                          className="w-8 h-8 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-orange-500">{product.name}</p>
                        <p className="text-xs text-gray-400">{product.price} ₺</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-6">
              {/* Mağaza Dropdown */}
              <div className="relative inline-block" ref={magazaRef}>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdown(activeDropdown === 'magaza' ? null : 'magaza');
                  }}
                  className="flex items-center space-x-1 text-sm hover:text-primary transition-colors py-2"
                >
                  <span>Mağaza</span>
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

       
              <Link to="/products/software" className="nav-link flex items-center text-sm font-medium hover:text-primary transition-colors">
                <Code className="h-4 w-4 mr-1.5" />
                Yazılım
              </Link>

              <Link to="/services/composite-manufacturing" className="nav-link flex items-center text-sm font-medium hover:text-primary transition-colors">
                <Factory className="h-4 w-4 mr-1.5" />
                Kompozit Üretim
              </Link>

              <Link to="/3d-model" className="nav-link flex items-center text-sm font-medium hover:text-primary transition-colors">
                <Printer3D className="h-4 w-4 mr-1.5" />
                3D Model
              </Link>
               
              {currentUser ? (
                <div 
                  className="relative inline-block" 
                  ref={userMenuRef}
                >
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setUserMenuOpen(prev => !prev);
                      setServicesMenuOpen(false);
                    }}
                    className="flex items-center text-foreground hover:text-primary transition-colors"
                  >
                    <User className="h-5 w-5 mr-1" />
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
                  className="text-foreground hover:text-primary transition-colors"
                >
                  Giriş Yap
                </Link>
              )}
              
              <Link to="/cart" className="relative">
                <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
                  <ShoppingCart className="h-5 w-5" />
                </button>
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <Link to="/cart" className="relative">
              <button className="bg-primary text-primary-foreground p-2 rounded-md hover:bg-primary/90 transition-colors">
                <ShoppingCart className="h-5 w-5" />
              </button>
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-foreground hover:text-primary transition-colors"
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

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black/90 backdrop-blur-sm border-t border-primary/20">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* Mağaza Section in Mobile Menu */}
            <div className="space-y-1">
              <button
                onClick={() => {
                  // Toggle main Mağaza menu
                  setActiveDropdown(activeDropdown === 'magaza' ? null : 'magaza');
                  // Reset expanded category when toggling main menu
                  setExpandedMobileCategory(null);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-primary/20 transition-colors"
              >
                <span>Mağaza</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${
                  activeDropdown === 'magaza' ? 'rotate-180' : ''
                }`} />
              </button>
              
              {/* Mobile Categories */}
              {activeDropdown === 'magaza' && (
                <div className="pl-4 space-y-1">
                  {/* Hepsi option for mobile */}
                  <div className="mb-1">
                    <Link
                      to="/products"
                      className="block w-full px-3 py-2 rounded-md text-sm font-medium hover:bg-primary/20 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Hepsi
                    </Link>
                  </div>
                  
                  {/* Divider */}
                  <div className="border-t border-primary/10 my-1"></div>
                  
                  {/* Category list */}
                  {categories.filter(cat => !cat.path || cat.path.length === 1).map((category) => (
                    <div key={category.id} className="space-y-1">
                      {/* Category button */}
                      <button
                        onClick={() => {
                          console.log('Mobile clicked category:', category.id);
                          // Toggle this category's expanded state
                          setExpandedMobileCategory(
                            expandedMobileCategory === category.id ? null : category.id
                          );
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-primary/20 transition-colors"
                      >
                        <span>{category.name}</span>
                        {category.subcategories?.length > 0 && (
                          <ChevronDown className={`h-4 w-4 transition-transform ${
                            expandedMobileCategory === category.id ? 'rotate-180' : ''
                          }`} />
                        )}
                      </button>
                      
                      {/* Mobile Subcategories */}
                      {expandedMobileCategory === category.id && category.subcategories && category.subcategories.length > 0 && (
                        <div className="pl-4 space-y-1 bg-primary/5 rounded-md py-1 mb-1">
                          {/* Category link (view all) */}
                          <Link
                            to={`/products?category=${encodeURIComponent(category.name)}`}
                            className="block px-3 py-2 rounded-md text-sm hover:bg-primary/10 transition-colors font-medium"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {category.name} - Tümü
                          </Link>
                          
                          {/* Subcategory links */}
                          {category.subcategories.map((subcat, index) => (
                            <Link
                              key={`${category.id}-${index}`}
                              to={`/products?category=${encodeURIComponent(category.name)}&subcategory=${encodeURIComponent(subcat)}`}
                              className="block px-3 py-2 rounded-md text-sm hover:bg-primary/10 transition-colors"
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
            
            <Link 
              to="/products/software"
              className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Code className="h-4 w-4 inline-block mr-2" />
              Yazılım
            </Link>
            
            <Link 
              to="/services/composite-manufacturing"
              className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Factory className="h-4 w-4 inline-block mr-2" />
              Kompozit Üretim
            </Link>

            <Link 
              to="/3d-model"
              className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Printer3D className="h-4 w-4 inline-block mr-2" />
              3D Model
            </Link>
            
            {currentUser ? (
              <>
                {isAdmin && (
                  <Link 
                    to="/admin"
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-foreground hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-foreground hover:text-primary transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Çıkış Yap
                </button>
              </>
            ) : (
              <Link 
                to="/login"
                className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Giriş Yap
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
