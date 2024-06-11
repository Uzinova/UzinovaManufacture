import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h2>Uzinovas</h2>
          <p>&copy; 2024 Uzinovas. All rights reserved.</p>
        </div>
        
        <div className="footer-section">
          <h3> </h3>
          <ul className="social-media">
            <li><a href="/contact">İletişim</a></li>
             
          </ul>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
