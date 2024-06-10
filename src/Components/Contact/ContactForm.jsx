// ContactForm.js
import React, { useState } from 'react';
import './ContactForm.css';
import { db } from '../../firebase'; // Firebase bağlantınızı import edin
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; // Firestore işlemleri için gerekli işlevler

function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Firestore'a form verilerini kaydetme
      await addDoc(collection(db, 'contacts'), {
        name,
        email,
        message,
        timestamp: serverTimestamp(), // Kaydın zamanını ekleyin
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Mesaj gönderilirken bir hata oluştu:', err);
      setError('Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <div className="contact-form-container">
      <h2>Bizimle İletişime Geçin</h2>
      {submitted ? (
        <div className="thank-you-message">Mesajınız için teşekkürler! En kısa sürede size geri döneceğiz.</div>
      ) : (
        <form className="contact-form" onSubmit={handleSubmit}>
          <label htmlFor="name">İsim</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label htmlFor="email">E-posta</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="message">Mesaj</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          ></textarea>

          <button type="submit">Gönder</button>
          {error && <div className="error-message">{error}</div>}
        </form>
      )}
    </div>
  );
}

export default ContactForm;
