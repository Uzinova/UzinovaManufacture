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
import "./Components/tamplate.css"
import LoginAdmin from './Components/AdminPanel/loginAdmin';
  
function App() {
  return (
    <div className='homepage-main'>
    

    <CartProvider>
    <Router>
    <nav className='headernav navbar navbar-expand-md navbar-dark navbar-fixed-top'>
  <div className='container-fluid d-flex justify-content-between align-items-center'>
    <Link style={{ textDecoration: 'none' }} to="/">
      <img className='logoimg' src='image/LOGOZ.png' alt='Logo' />
    </Link>
    <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      <span className="navbar-toggler-icon"></span>
    </button>
    <div className='collapse navbar-collapse' id='navbarNav'>
      <div className='menu navbar-nav ml-auto'>
        <a className="nav-item nav-link" target="_blank" rel="noopener noreferrer" href="https://uzinova.com">Hakkımızda</a>
        <a className="nav-item nav-link" href='#siparis'>Sipariş Takibi</a>
        <a className="nav-item nav-link" href='/contact'>İletişim</a>
        <a className="nav-item nav-link"><CartIcon /></a>
      </div>
    </div>
    <LiveChat />
  </div>
</nav>

      <Routes>
        <Route path="/contact" element={<ContactPage/>} />
        <Route path='/' element={<Mainpage />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/:categoryName" element={<CategoryPage />} />
        <Route path="/uziadmin" element={<LoginAdmin />} />
      
      </Routes>
    </Router>
 
  </CartProvider>
 
  <Footer/>
  </div>
  );
}

export default App;
