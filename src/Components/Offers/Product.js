import React, { useState } from 'react';
import './Product.css'; // Make sure this path is correct for your setup
import { Link } from 'react-router-dom';
import { CartContext } from '../Cart/CartContext';
import Notification from '../Notification/Notification';

const Product = ({ product }) => {
  const { addToCart } = React.useContext(CartContext);
  const [isAdding, setIsAdding] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart(product);
    setShowNotification(true);
    setTimeout(() => {
      setIsAdding(false);
      setShowNotification(false);
    }, 1000); // duration of the animation and notification
  };

  return (
    <div className="product col-2 col-md-2">
      <Link to={`/product/${product.id}`} className="text-decoration-none">
        <div className="product-info">
          <img src={product.image} alt={product.name} className="product-image   " />
          <h3 className="product-name">{product.name}</h3>
          <h3 className="product-description">{product.description}</h3>
          
        
        </div>
      </Link>
      <button
        className={`get-offer-button ${isAdding ? 'adding' : ''}`}
        onClick={handleAddToCart}
      >
        🛒
      </button>
      <Notification message="Ürün sepete eklendi!" show={showNotification} />
    </div>
  );
};

export default Product;
