// src/OffersTab.js
import React, { useState, useEffect } from 'react';
import { db } from '../../firebase'; // Adjust the path to your Firebase initialization
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import './OffersTab.css'; // Adjust the path to your CSS file

const OffersTab = () => {
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    // Fetch offers from Firestore
    const fetchOffers = async () => {
      try {
        const offersRef = collection(db, 'offers');
        const snapshot = await getDocs(offersRef);
        if (snapshot.empty) {
          console.log('Offers collection not found or it is empty');
        } else {
          const offersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setOffers(offersData);
          console.log('Fetched offers:', offersData); // Print fetched offers to the console
        }
      } catch (error) {
        console.error('Error fetching offers:', error);
      }
    };

    fetchOffers();
  }, []);

  const handleDeleteOffer = async (offerId) => {
    try {
      await deleteDoc(doc(db, 'offers', offerId));
      setOffers(offers.filter(offer => offer.id !== offerId));
    } catch (error) {
      console.error('Error deleting offer:', error);
    }
  };

  return (
    <div className="offers-tab">
      <h3>Offers</h3>
      {offers.length === 0 ? (
        <p>No offers available</p>
      ) : (
        offers.map(offer => (
          <div key={offer.id} className="offer-item">
            <div className="offer-info">
              <p><strong>Name:</strong> {offer.name}</p>
              <p><strong>Surname:</strong> {offer.surname}</p>
              <p><strong>Email:</strong> {offer.email}</p>
              <p><strong>Phone:</strong> {offer.phone}</p>
              <p><strong>Items:</strong> 
                {offer.cartItems ? (
                  <ul>
                    {offer.cartItems.map((item, index) => (
                      <li key={index}>
                        <p>{item.name} - {item.quantity} </p> {/* Assuming each item has name and price properties */}
                      </li>
                    ))}
                  </ul>
                ) : 'No items'}
              </p>            </div>
            <button onClick={() => handleDeleteOffer(offer.id)} className="delete-offer-btn">Delete</button>
          </div>
        ))
      )}
    </div>
  );
};

export default OffersTab;
