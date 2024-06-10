import React, { useEffect, useState } from 'react';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './SaleSlider.css';
import { fetchProductsOnSale, fetchProductById } from '../listdata';
import SaleCard from '../Card-sale/SaleCard';
import Slider from 'react-slick';
import { CartContext } from '../Cart/CartContext';
import Notification from '../Notification/Notification';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
const SaleSlider = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const { addToCart } = React.useContext(CartContext);
    const [isAdding, setIsAdding] = useState(false);
    const [showNotification, setShowNotification] = useState(false);

    const handleAddToCart = (product) => {
        setIsAdding(true);
        addToCart(product);
        setShowNotification(true);
        setTimeout(() => {
            setIsAdding(false);
            setShowNotification(false);
        }, 1000);
    };

   
 
    const [saleProducts, setSaleProducts] = useState([]);
    useEffect(() => {
        const getSaleProducts = async () => {
            try {
                const products = await fetchProductsOnSale();
                console.log("Fetched sale products:", products); // Debugging log
                setSaleProducts(products);
            } catch (error) {
                console.error("Error fetching sale products:", error);
            }
        };

        getSaleProducts();
    }, []);

    const settings = {
        dots: true,
        infinite: false,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
       
    };

  

    return (
        <div className='salecontainer  '>
            <p className='saleHeader'>Fırsat Ürünler</p>
            <div className='mt-20'>
                <Slider {...settings}>
                    {saleProducts.map((saleProduct) => (
                            <Link to={`/product/${saleProduct.id}`} className="text-decoration-none">
                        <div className="containerSale" key={saleProduct.id}>
                            <div className="boxSale">
                              
                                <img className='saleimg' src={saleProduct.image} alt={saleProduct.name} />
                                <span className="titleSale">{saleProduct.name}</span>
                                 
                            </div>
                        </div>
                        </Link>
                    ))}
                </Slider>
            </div>
        </div>
    );
}

export default SaleSlider;
