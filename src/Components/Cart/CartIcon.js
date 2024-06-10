// src/CartIcon.js
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { CartContext } from './CartContext';
import './CartIcon.css'; // optional, for styling

const CartIcon = () => {
  const { getTotalItems } = useContext(CartContext);

  return (
    <div className="cart-icon collapsed">
      <Link to="/cart">
        <FontAwesomeIcon icon={faShoppingCart} size="2x" />
        {getTotalItems() > 0 && <span className="cart-counter">{getTotalItems()}</span>}
      </Link>
    </div>
  );
};

export default CartIcon;
