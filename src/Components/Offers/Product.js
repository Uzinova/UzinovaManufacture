import React, { useState } from 'react';
import './Product.css'; // Ensure the path is correct
import { Link } from 'react-router-dom';
import { CartContext } from '../Cart/CartContext';
import Notification from '../Notification/Notification';

const Product = ({ product }) => {
  const { addToCart } = React.useContext(CartContext);
  const [isAdding, setIsAdding] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const handleAddToCart = (event) => {
    event.preventDefault(); // Prevent navigation when clicking the button inside the link
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
    <Link to={`/product/${product.id}`} className="text-decoration-none">
      <div className="cardPro">
        <div className='cardProInfo'>
        <div className="cardPro-img">
          <div className="img">
            <img src={product.image} alt={product.name} className="product-image" />
          </div>
        </div>
        <div className="cardPro-title">{product.name}</div>
        <div
          className="cardPro-subtitle"
          dangerouslySetInnerHTML={{ __html: cleanDescription(product.description) }}
        ></div>

        </div>
       
        <hr className="cardPro-divider" />
        <div className="cardPro-footer">
         
          <button
            className={`cardPro-btn get-offer-button ${isAdding ? 'adding' : ''}`}
            onClick={handleAddToCart}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <path d="m397.78 316h-205.13a15 15 0 0 1 -14.65-11.67l-34.54-150.48a15 15 0 0 1 14.62-18.36h274.27a15 15 0 0 1 14.65 18.36l-34.6 150.48a15 15 0 0 1 -14.62 11.67zm-193.19-30h181.25l27.67-120.48h-236.6z"></path>
              <path d="m222 450a57.48 57.48 0 1 1 57.48-57.48 57.54 57.54 0 0 1 -57.48 57.48zm0-84.95a27.48 27.48 0 1 0 27.48 27.47 27.5 27.5 0 0 0 -27.48-27.47z"></path>
              <path d="m368.42 450a57.48 57.48 0 1 1 57.48-57.48 57.54 57.54 0 0 1 -57.48 57.48zm0-84.95a27.48 27.48 0 1 0 27.48 27.47 27.5 27.5 0 0 0 -27.48-27.47z"></path>
              <path d="m158.08 165.49a15 15 0 0 1 -14.23-10.26l-25.71-77.23h-47.44a15 15 0 1 1 0-30h58.3a15 15 0 0 1 14.23 10.26l29.13 87.49a15 15 0 0 1 -14.23 19.74z"></path>
            </svg>
          </button>
          <Notification message="Ürün sepete eklendi!" show={showNotification} />
        </div>
      </div>
    </Link>
  );
};

export default Product;
