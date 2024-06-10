// ContactPage.js
import React from 'react';
import ContactForm from './ContactForm';
import './ContactPage.css';

function ContactPage() {
  return (
    <div className="contact-page">
      <div className="contact-info">
        <h2>İletişim Bilgileri</h2>
        <p>Adres: 1234 Örnek Sokak, İstanbul, Türkiye</p>
        <p>Telefon: +90 123 456 78 90</p>
        <p>E-posta: info@company.com</p>
        {/* Harita veya diğer bileşenler buraya eklenebilir */}
      </div>
      <ContactForm />
    </div>
  );
}

export default ContactPage;
