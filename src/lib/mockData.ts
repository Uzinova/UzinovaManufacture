// Mock data to use when Firebase connection fails
import { v4 as uuidv4 } from 'uuid';

// Helper to load mock data from localStorage or use defaults
const loadMockData = <T>(key: string, defaultData: T[]): T[] => {
  try {
    const storedData = localStorage.getItem(`mock_${key}`);
    return storedData ? JSON.parse(storedData) : defaultData;
  } catch (error) {
    console.error(`Error loading mock data for ${key}:`, error);
    return defaultData;
  }
};

// Helper to save mock data to localStorage
const saveMockData = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(`mock_${key}`, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving mock data for ${key}:`, error);
  }
};

// Default mock data
const defaultHeroSlides = [
  {
    id: "slide1",
    image_url: "https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?auto=format&fit=crop&q=80",
    title: "Next Generation Model Rocketry",
    subtitle: "Professional model rocket and probe rocket solutions",
    cta_text: "Explore Now",
    cta_url: "/products",
    display_order: 0,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "slide2",
    image_url: "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?auto=format&fit=crop&q=80",
    title: "Aerospace-Grade Components",
    subtitle: "Engineered for reliability and performance",
    cta_text: "Shop Components",
    cta_url: "/products",
    display_order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const defaultCarouselImages = [
  {
    id: "carousel1",
    image_url: "https://images.unsplash.com/photo-1486825586573-7131f7991bdd?auto=format&fit=crop&q=80",
    title: "High-Performance Rockets",
    description: "View our latest collection of model rockets",
    link_url: "/products",
    display_order: 0,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const defaultNewsCategories = [
  {
    id: "cat1",
    name: "News",
    slug: "news",
    created_at: new Date().toISOString()
  },
  {
    id: "cat2",
    name: "Technology",
    slug: "technology",
    created_at: new Date().toISOString()
  },
  {
    id: "cat3",
    name: "Events",
    slug: "events",
    created_at: new Date().toISOString()
  }
];

const defaultNewsArticles = [
  {
    id: "news1",
    title: "New Model Rocket Line Launched",
    content: "<p>We're excited to announce our new line of high-performance model rockets!</p>",
    featured_image: "https://images.unsplash.com/photo-1518365050014-70fe7232897f?auto=format&fit=crop&q=80",
    category_id: "cat1",
    tags: ["rockets", "launch", "new-products"],
    author: "Rocket Team",
    status: "published",
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const defaultProductLabels = [
  {
    id: "label1",
    name: "New",
    color: "#4caf50",
    created_at: new Date().toISOString()
  },
  {
    id: "label2",
    name: "Best Seller",
    color: "#ff9800",
    created_at: new Date().toISOString()
  },
  {
    id: "label3",
    name: "Limited Edition",
    color: "#e91e63",
    created_at: new Date().toISOString()
  }
];

const defaultProducts = [
  {
    id: "prod1",
    name: "Explorer Pro Rocket",
    price: 299.99,
    description: "<p>High-performance model rocket with advanced recovery system.</p>",
    category: "Model Rockets",
    categoryPath: ["Rockets", "Model Rockets"],
    images: [
      "https://images.unsplash.com/photo-1567416661576-659c4298a2c6?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1565696008736-c4f1b0f3b3b0?auto=format&fit=crop&q=80"
    ],
    mainImageIndex: 0,
    stock: 15,
    featured: true,
    sku: "EXP-2025-ABCD",
    labels: ["label1", "label2"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "prod2",
    name: "Telemetry Module X1",
    price: 149.99,
    description: "<p>Advanced telemetry module for real-time flight data.</p>",
    category: "Electronics",
    categoryPath: ["Components", "Electronics"],
    images: [
      "https://images.unsplash.com/photo-1580584126903-c17d41830450?auto=format&fit=crop&q=80"
    ],
    mainImageIndex: 0,
    stock: 23,
    featured: false,
    sku: "TLM-2025-WXYZ",
    discount_rate: 15,
    discount_start: new Date().toISOString(),
    discount_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const defaultCategories = [
  {
    id: "cat1",
    name: "Rockets",
    created_at: new Date().toISOString()
  },
  {
    id: "cat2",
    name: "Model Rockets",
    parent_id: "cat1",
    path: ["Rockets", "Model Rockets"],
    created_at: new Date().toISOString()
  },
  {
    id: "cat3",
    name: "Components",
    created_at: new Date().toISOString()
  },
  {
    id: "cat4",
    name: "Electronics",
    parent_id: "cat3",
    path: ["Components", "Electronics"],
    created_at: new Date().toISOString()
  }
];

// Load mock data from localStorage or use defaults
export const mockData = {
  heroSlides: loadMockData("heroSlides", defaultHeroSlides),
  carouselImages: loadMockData("carouselImages", defaultCarouselImages),
  newsCategories: loadMockData("newsCategories", defaultNewsCategories),
  newsArticles: loadMockData("newsArticles", defaultNewsArticles),
  productLabels: loadMockData("productLabels", defaultProductLabels),
  products: loadMockData("products", defaultProducts),
  categories: loadMockData("categories", defaultCategories)
};

// Mock implementation of Firebase Firestore functions
export const mockFirestore = {
  getDocs: async (query: any) => {
    try {
      // Extract collection name from query
      const collectionPath = query._path?.segments?.[0];
      if (!collectionPath) throw new Error("Invalid query path");
      
      let data;
      switch (collectionPath) {
        case 'hero_slides':
          data = mockData.heroSlides;
          break;
        case 'carousel_images':
          data = mockData.carouselImages;
          break;
        case 'news_categories':
          data = mockData.newsCategories;
          break;
        case 'news_articles':
          data = mockData.newsArticles;
          break;
        case 'product_labels':
          data = mockData.productLabels;
          break;
        case 'products':
          data = mockData.products;
          break;
        case 'categories':
          data = mockData.categories;
          break;
        default:
          return { docs: [] };
      }
      
      // Handle simple orderBy (just a basic implementation)
      const orderByField = query._query?.orderBy?.[0]?.field?.segments?.[0];
      const orderDirection = query._query?.orderBy?.[0]?.dir === 'asc' ? 1 : -1;
      
      if (orderByField) {
        data = [...data].sort((a, b) => {
          if (a[orderByField] < b[orderByField]) return -1 * orderDirection;
          if (a[orderByField] > b[orderByField]) return 1 * orderDirection;
          return 0;
        });
      }
      
      // Return docs in the format expected by Firebase
      return {
        docs: data.map(item => ({
          id: item.id,
          data: () => {
            const { id, ...rest } = item;
            return rest;
          }
        }))
      };
    } catch (error) {
      console.error("Mock getDocs error:", error);
      throw error;
    }
  },
  
  addDoc: async (collectionRef: any, data: any) => {
    try {
      const collectionPath = collectionRef.path;
      if (!collectionPath) throw new Error("Invalid collection reference");
      
      const newId = uuidv4();
      const newItem = { id: newId, ...data };
      
      let collectionName;
      switch (collectionPath) {
        case 'hero_slides':
          collectionName = 'heroSlides';
          mockData.heroSlides.push(newItem);
          break;
        case 'carousel_images':
          collectionName = 'carouselImages';
          mockData.carouselImages.push(newItem);
          break;
        case 'news_categories':
          collectionName = 'newsCategories';
          mockData.newsCategories.push(newItem);
          break;
        case 'news_articles':
          collectionName = 'newsArticles';
          mockData.newsArticles.push(newItem);
          break;
        case 'product_labels':
          collectionName = 'productLabels';
          mockData.productLabels.push(newItem);
          break;
        case 'products':
          collectionName = 'products';
          mockData.products.push(newItem);
          break;
        case 'categories':
          collectionName = 'categories';
          mockData.categories.push(newItem);
          break;
        default:
          throw new Error(`Unknown collection: ${collectionPath}`);
      }
      
      saveMockData(collectionName, mockData[collectionName]);
      
      return {
        id: newId,
        path: `${collectionPath}/${newId}`
      };
    } catch (error) {
      console.error("Mock addDoc error:", error);
      throw error;
    }
  },
  
  updateDoc: async (docRef: any, data: any) => {
    try {
      const [collectionPath, docId] = docRef.path.split('/');
      if (!collectionPath || !docId) throw new Error("Invalid document reference");
      
      let collectionName, items;
      switch (collectionPath) {
        case 'hero_slides':
          collectionName = 'heroSlides';
          items = mockData.heroSlides;
          break;
        case 'carousel_images':
          collectionName = 'carouselImages';
          items = mockData.carouselImages;
          break;
        case 'news_categories':
          collectionName = 'newsCategories';
          items = mockData.newsCategories;
          break;
        case 'news_articles':
          collectionName = 'newsArticles';
          items = mockData.newsArticles;
          break;
        case 'product_labels':
          collectionName = 'productLabels';
          items = mockData.productLabels;
          break;
        case 'products':
          collectionName = 'products';
          items = mockData.products;
          break;
        case 'categories':
          collectionName = 'categories';
          items = mockData.categories;
          break;
        default:
          throw new Error(`Unknown collection: ${collectionPath}`);
      }
      
      const index = items.findIndex(item => item.id === docId);
      if (index === -1) throw new Error(`Document with ID ${docId} not found`);
      
      items[index] = { ...items[index], ...data, id: docId };
      saveMockData(collectionName, items);
      
      return {};
    } catch (error) {
      console.error("Mock updateDoc error:", error);
      throw error;
    }
  },
  
  deleteDoc: async (docRef: any) => {
    try {
      const [collectionPath, docId] = docRef.path.split('/');
      if (!collectionPath || !docId) throw new Error("Invalid document reference");
      
      let collectionName, items;
      switch (collectionPath) {
        case 'hero_slides':
          collectionName = 'heroSlides';
          items = mockData.heroSlides;
          break;
        case 'carousel_images':
          collectionName = 'carouselImages';
          items = mockData.carouselImages;
          break;
        case 'news_categories':
          collectionName = 'newsCategories';
          items = mockData.newsCategories;
          break;
        case 'news_articles':
          collectionName = 'newsArticles';
          items = mockData.newsArticles;
          break;
        case 'product_labels':
          collectionName = 'productLabels';
          items = mockData.productLabels;
          break;
        case 'products':
          collectionName = 'products';
          items = mockData.products;
          break;
        case 'categories':
          collectionName = 'categories';
          items = mockData.categories;
          break;
        default:
          throw new Error(`Unknown collection: ${collectionPath}`);
      }
      
      const index = items.findIndex(item => item.id === docId);
      if (index === -1) throw new Error(`Document with ID ${docId} not found`);
      
      items.splice(index, 1);
      saveMockData(collectionName, items);
      
      return {};
    } catch (error) {
      console.error("Mock deleteDoc error:", error);
      throw error;
    }
  }
};
