import React, { useState } from 'react';
import './Product.css'; // Ensure the path is correct
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

  // Clean up the product description to remove excessive <p><br></p> tags
  const cleanDescription = (description) => {
    return description.replace(/<p><br><\/p>/g, '').trim();
  };

  return (
    <div className="product col-2 col-md-2">
      <Link to={`/product/${product.id}`} className="text-decoration-none">
        <div className="product-info">
          <img src={product.image} alt={product.name} className="product-image" />
          <h3 className="product-name">{product.name}</h3>
          <div
            className="product-description"
            dangerouslySetInnerHTML={{ __html: cleanDescription(product.description) }}
          ></div>
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
