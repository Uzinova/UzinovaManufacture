// src/App.js
import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

import Mainpage from './Components/MainPage/Mainpage';
import ProductDetail from './Components/Offers/ProductDetail';
import LiveChat from './Components/MainPage/LiveChat';
import Cart from './Components/Cart/Cart';
import { CartProvider } from './Components/Cart/CartContext';
import CartIcon from './Components/Cart/CartIcon';
import AdminPanel from './Components/AdminPanel/AdminPanel';
import Footer from './Components/footer/Footer';
import CategoryPage from './Components/Offers/CategoryPage';
import ContactPage from './Components/Contact/ContactPage';
 
  
function App() {
  return (
    <div className='homepage-main'>
    

    <CartProvider>
    <Router>
    <nav className='headernav navbar navbar-expand-md navbar-dark navbar-fixed-top'>
  <div className='navcont container-fluid d-flex justify-content-between align-items-center'>
    <Link style={{ textDecoration: 'none' }} to="/"  >
      <div className='headertxt h1'>UZINOVA</div>

    </Link>
    <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      <span className="navbar-toggler-icon"></span>
    </button>
    <div className='collapse navbar-collapse' id='navbarNav'>
      <div className='menu navbar-nav ml-auto'>
        <a className="nav-item  "target="_blank" rel="noopener noreferrer" href="https://uzinova.com">Biz Kimiz</a>
        <a className="nav-item  " href='#siparis'>Sipariş Takibi</a>
        <a className="nav-item  " href='/iletisim'>İletişim</a>
        
        <a className="nav-item "><CartIcon /></a>
      </div>
    </div>
  
    <LiveChat />
  </div>
</nav>
   

      <Routes>
        <Route path='/' element={<Mainpage />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/:categoryName" element={<CategoryPage />} />
        <Route path="/iletisim" element={<ContactPage />} />
      </Routes>
    </Router>
    
  </CartProvider>
  <Footer/>
  </div>
  );
}

export default App;
