// src/Cart.js
import React, { useContext, useState } from 'react';
import { CartContext } from './CartContext';
import './Cart.css'; // optional, for styling
import GetOfferForm from './GetOfferForm';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity } = useContext(CartContext);
  const [isOfferFormOpen, setIsOfferFormOpen] = useState(false);

  const isCartEmpty = cartItems.length === 0;

  return (
    <div className="cart">
      <h2>Sepet</h2>
      {isCartEmpty ? (
        <p>Sepetiniz Boş</p>
      ) : (
        cartItems.map(item => (
          <div key={item.id} className="cart-item">
            <img src={item.image} alt={item.name} className="cart-item-image" />
            <div className="cart-item-info">
              <h3 className="cart-item-name">{item.name}</h3>
              <p className="cart-item-category">{item.category}</p>
              <input 
                type="number" 
                value={item.quantity} 
                onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))} 
                className="cart-item-quantity"
              />
              <button onClick={() => removeFromCart(item.id)} className="remove-item-button">Kaldır</button>
            </div>
          </div>
        ))
      )}
      <button 
        onClick={() => setIsOfferFormOpen(true)} 
        className={`get-offer-button ${isCartEmpty ? 'disabled' : ''}`} 
        disabled={isCartEmpty}
      >
        Teklif Al
      </button>
      {isOfferFormOpen && <GetOfferForm />}
    </div>
  );
};

export default Cart;
