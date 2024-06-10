import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './Catagoryslider.css';
import { fetchProducts } from '../listdata';

const tags = ["On Sale", "Hot", "New", "Limited Edition", "Best Seller"];

const getRandomTag = () => tags[Math.floor(Math.random() * tags.length)];

const Catagoryslider = () => {
  const [saleProducts, setSaleProducts] = useState([]);

  useEffect(() => {
    const getSaleProducts = async () => {
      try {
        const products = await fetchProducts();
        console.log("Fetched sale products:", products);
        const productsWithTags = products.map(product => ({
          ...product,
         
        }));
        setSaleProducts(productsWithTags);
      } catch (error) {
        console.error("Error fetching sale products:", error);
      }
    };

    getSaleProducts();
  }, []);

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 2,
    autoplay: true,
    autoplaySpeed: 3000,
    
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          initialSlide: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className="catagoryslider-container container">
        <div className='headercatag'>
        <p className="cattext">FIRSAT ÜRÜNLER </p>

        </div>
 
      <div  >
        <ul className="list-unstyled"></ul>
      </div>
      <div>
        <Slider {...settings}>
          {saleProducts.map((product) => (
            <div key={product.id} className="product-item">
              <h5>{product.name}</h5>
              <div className="image-container">
                <img className="catsliderimg" src={product.image} alt={product.name} />
                {product.tag && <span className="product-tag">{product.tag}</span>}
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default Catagoryslider;
