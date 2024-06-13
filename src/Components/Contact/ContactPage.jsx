// ContactPage.js
import React from 'react';
import ContactForm from './ContactForm';
import './ContactPage.css';

const ContactPage = () => {
  return (
    <div className="contact-page">
      <div className="contact-info">
        <h2>İletişim Bilgileri</h2>
        <p>Adres: Kemalpaşa, Güldeste Sk. No:3, 54000 Serdivan/Sakarya        </p>
        <p>Telefon: +90 536 582 19 02</p>
        <p>E-posta: uzinovas@gmail.com</p>
        {/* Harita veya diğer bileşenler buraya eklenebilir */}
      </div>
      <ContactForm />
    </div>
  );
}

export default ContactPage;
