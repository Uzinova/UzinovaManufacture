import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h2>Uzinova Manufacture</h2>
          <p>&copy; 2024 Uzinova Manufacture. All rights reserved.</p>
        </div>
        
        <div className="footer-section">
          <h3>Follow Us</h3>
          <ul className="social-media">
            <li><a href="iletisim">İletişim</a></li>
             
          </ul>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
