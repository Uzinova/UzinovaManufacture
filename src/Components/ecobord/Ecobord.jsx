import React, { useEffect } from 'react';
 
 
import './Ecobord.css';
import { Link } from 'react-router-dom';

function Ecobord() {
    
   
    
    return (
        <div className="container-fluid mb-3">
            <div className="row px-xl-5">
                <div className="col-lg-8">
                    <div id="header-carousel" className="carousel slide carousel-fade mb-30 mb-lg-0" data-ride="carousel">
                        <ol className="carousel-indicators">
                            <li data-target="#header-carousel" data-slide-to="0" className="active"></li>
                            <li data-target="#header-carousel" data-slide-to="1"></li>
                            <li data-target="#header-carousel" data-slide-to="2"></li>
                        </ol>
                        <div className="carousel-inner">
                            <div className="carousel-item position-relative active" style={{ height: '430px' }}>
                                <img className=" " src="image/img4.png" style={{ objectFit: 'cover' }} alt="Slide 1" />
                                <div className="carousel-caption d-flex flex-column align-items-center justify-content-center">
                                    <div className="p-3" style={{ maxWidth: '700px' }}>
                                        <h1 className="display-4 text-white mb-3 animate__animated animate__fadeInDown">Kompozit Üretim</h1>
                                        <p className="mx-md-5 px-5 animate__animated animate__bounceIn"> Roket, İHA ve özel parçalarınızı kaliteden ödün vermeden avantajlı fiyatlarla ürettirin. Uzman ekibimizle, en zorlu tasarımlarınızı hayata geçirin ve projelerinizi bir adım öne taşıyın.  </p>
                                        <Link to={'/Kompozit'}>  <a className="btn btn-outline-light py-2 px-4 mt-3 animate__animated animate__fadeInUp" href="#">İncele</a></Link>
                                    </div>
                                </div>
                            </div>
                            <div className="carousel-item position-relative" style={{ height: '430px' }}>
                                <img className=" " src="image/img5.png" style={{ objectFit: 'cover' }} alt="Slide 2" />
                                <div className="carousel-caption d-flex flex-column align-items-center justify-content-center">
                                    <div className="p-3" style={{ maxWidth: '700px' }}>
                                        <h1 className="display-4 text-white mb-3 animate__animated animate__fadeInDown">Uçuş Malzemeleri</h1>
                                        <p className="mx-md-5 px-5 animate__animated animate__bounceIn"> Her projenizin ihtiyaçlarını karşılayacak yüksek kaliteli parçaları kolayca ve hızlı bir şekilde temin edin. Geniş ürün yelpazemiz sayesinde projeleriniz için en uygun çözümleri bulabilirsiniz. </p>
                                       <Link to={'/Malzeme'}><a className="btn btn-outline-light py-2 px-4 mt-3 animate__animated animate__fadeInUp" href="#">İncele</a></Link> 
                                    </div>
                                </div>
                            </div>
                            <div className="carousel-item position-relative" style={{ height: '430px' }}>
                                <img className=" " src="image/img8.png" style={{ objectFit: 'cover' ,filter:'brightness(50%)' }} alt="Slide 3" />
                                <div className="carousel-caption d-flex flex-column align-items-center justify-content-center">
                                    <div className="p-3" style={{ maxWidth: '700px' }}>
                                        <h1 className="display-4 text-white mb-3 animate__animated animate__fadeInDown">Aviyonik Kitler </h1>
                                        <p className="mx-md-5 px-5 animate__animated animate__bounceIn">Projelerinizde güvenle kullanabileceğiniz yüksek kaliteli aviyonik kitler sunuyoruz. Güvenilir, hassas ve performans odaklı çözümlerimizle uçuş güvenliğinizi ve verimliliğinizi artırın.</p>
                                        <Link to={'/Aviyonik'}>    <a className="btn btn-outline-light py-2 px-4 mt-3 animate__animated animate__fadeInUp" href="#">İncele</a> </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4">
                    <div className="product-offer mb-30" style={{ height: '200px' }}>
                        <img className="img-fluid" src="image/img6.png" alt="Offer 1" />
                        <div className="offer-text">
                            <h6   className="text-white text-uppercase">Yeni</h6>
                            <h3 className="text-white mb-3">Yazılım Ürünleri</h3>
                            <Link to={'/Yazilim'}>     <a href="#" className="btn btn-primary">Incele</a></Link>
                        </div>
                    </div>
                    <div className="product-offer mb-30" style={{ height: '200px' }}>
                        <img className="img-fluid" src="image/img7.png" alt="Offer 2" />
                        <div className="offer-text">
                            <h6 className="text-white text-uppercase">Yeni</h6>
                            <h3 className="text-white mb-3">Teknik Destek</h3>
                            <Link to={'/Destek'}>    <a href="#" className="btn btn-primary">İncele</a></Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Ecobord;
