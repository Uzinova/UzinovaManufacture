// src/GetOfferForm.js
import React, { useState, useContext } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import './GetOfferForm.css'; // optional, for styling
import { CartContext } from './CartContext';

const GetOfferForm = () => {
  const { cartItems, clearCart } = useContext(CartContext);
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userOffer = {
      ...formData,
      cartItems,
      timestamp: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, 'offers'), userOffer);
      setIsSubmitted(true);
      clearCart(); // Clear the cart after successful submission
    } catch (error) {
      console.error("Error saving offer to Firestore:", error);
    }
  };

  if (isSubmitted) {
    return <div>Teşekkürler sizlerle en kısa sürede iletişe geçilecektir</div>;
  }

  return (
    <form className="get-offer-form" onSubmit={handleSubmit}>
      <h3>Get Offer</h3>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Isim"
        required
      />
      <input
        type="text"
        name="surname"
        value={formData.surname}
        onChange={handleChange}
        placeholder="Soyisim"
        required
      />
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="E-posta"
        required
      />
      <input
        type="text"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        placeholder="Telefon No"
        required
      />
      <button type="submit">
        Gönder
      </button>
    </form>
  );
};

export default GetOfferForm;
