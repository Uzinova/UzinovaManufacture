import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white p-4">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="md:w-1/2">
            <h2 className="text-2xl font-bold mb-4">Bize Ulaşın</h2>
            <p>
              İletişim bilgilerinizi burada bulabilirsiniz.
            </p>
          </div>
          <div className="md:w-1/2">
            <h2 className="text-2xl font-bold mb-4">Hızlı Linkler</h2>
            <div className="flex flex-col md:flex-row justify-between">
              <Link to="/services/composite-manufacturing" className="hover:text-primary transition-colors">
                Kompozit Üretim
              </Link>
              <Link to="/contact" className="hover:text-primary transition-colors">
                İletişim
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 