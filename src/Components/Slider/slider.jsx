import React, { useState, useEffect } from 'react';
import './sliderZ.css';

const SliderZ = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const slides = [
        {
            src: 'image/img1.jpg',
            title: 'Kompozit',
            description: 'Uzinova ile projelerinizi, en kaliteli karbon ve cam elyaf malzemelerle hayata geçirin. Dayanıklılık ve hafifliği bir araya getiren çözümlerimizle, inovasyonun sınırlarını zorlayın.'
        },
        {
            src: 'image/img2.jpg',
            title: 'Aviyonik',
            description: 'Yüksek performans ve güvenilirlik sunan aviyonik çözümlerimizle, projelerinizi en üst seviyeye taşıyın. Uzinova ile hedeflerinizi güvenle gerçekleştirin.'
        },
        {
            src: 'image/img3.png',
            title: 'Malzeme',
            description: 'Projeleriniz için gereken tüm malzemeleri tek bir yerde bulun. Kaliteden ödün vermeden, en uygun çözümlerle üretim sürecinizi hızlandırın ve optimize edin.'
        }
    ];
    

    const handlePrevClick = () => {
        const index = currentIndex === 0 ? slides.length - 1 : currentIndex - 1;
        setCurrentIndex(index);
    };

    const handleNextClick = () => {
        const index = currentIndex === slides.length - 1 ? 0 : currentIndex + 1;
        setCurrentIndex(index);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex(prevIndex => (prevIndex === slides.length - 1 ? 0 : prevIndex + 1));
        }, 7000); // Change slide every 3 seconds

        return () => clearInterval(interval); // Cleanup the interval on component unmount
    }, [slides.length]);

    return (
        <div className="slider">
            <div className="list">
                {slides.map((slide, index) => (
                    <div key={index} className={`item ${index === currentIndex ? 'active' : ''}`}>
                        <img src={slide.src} alt={`Slide ${index + 1}`} />
                        <div className="content">
                            <p>UZINOVA</p>
                            <h2>{slide.title}</h2>
                            <p>{slide.description}</p>
                        </div>
                    </div>
                ))}
            </div>

         
           
        </div>
    );
};

export default SliderZ;
