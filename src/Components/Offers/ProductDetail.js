import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // import styles
import './ProductDetail.css'; // Ensure the path is correct
import { fetchProductById } from '../listdata';
import { CartContext } from '../Cart/CartContext';
import Notification from '../Notification/Notification';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = React.useContext(CartContext);
  const [isAdding, setIsAdding] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart(product);
    setShowNotification(true);
    setTimeout(() => {
      setIsAdding(false);
      setShowNotification(false);
    }, 1000); // duration of the animation and notification
  };

  useEffect(() => {
    const getProduct = async () => {
      const productData = await fetchProductById(id);
      setProduct(productData);
      setLoading(false);
    };

    getProduct();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className="product-detail">
      <div className="product-detail-container">
        <div className="product-detail-image-section">
          <img src={product.image} alt={product.name} className="product-detail-image" />
        </div>
        <div className="product-detail-info-section">
          <h1 className="product-detail-name">{product.name}</h1>
          <p className="product-detail-category">{product.category}</p>
          <div className="product-detail-description">
            <ReactQuill
              value={product.description}
              readOnly={true}
              theme="bubble"
            />
          </div>
          <button onClick={handleAddToCart} className="add-to-cart-button">🛒 Sepete Ekle</button>
          <Notification message="Ürün sepete eklendi!" show={showNotification} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
