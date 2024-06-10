import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import './board.css'
import sec1 from '../../assets/TST2.png' 
import sec2 from '../../assets/TST3.png' 
import sec3 from '../../assets/TST4.png' 

const Board = () => {
  return (
    <div className='container cardcont'>
      <div className="row justify-content-center">
        <div className="col-12 col-xs-12 col-md-6 col-lg-4 mb-4">
          <div className="card">
            <div className="card__image">
              <img src={sec1} alt="Card 1" />
            </div>
            <div className="card__content">
              <span className="title">Kompozit Üretim</span>
              <p>Roket, İHA ve özel parçalarınızı  kaliteden ödün vermeden avantajlı fiyatlarla ürettirin. Uzman ekibimizle, en zorlu tasarımlarınızı hayata geçirin ve projelerinizi bir adım öne taşıyın.</p>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-4">
          <div className="card">
            <div className="card__image">
              <img src={sec2} alt="Card 2" />
            </div>
            <div className="card__content">
              <span className="title">Uçuş  ve Alt Sistem Malzemeleri</span>
              <p>Her projenizin ihtiyaçlarını karşılayacak yüksek kaliteli parçaları kolayca ve hızlı bir şekilde temin edin. Geniş ürün yelpazemiz sayesinde projeleriniz için en uygun çözümleri bulabilirsiniz.</p>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-4">
          <div className="card">
            <div className="card__image">
              <img src={sec3} alt="Card 3" />
            </div>
            <div className="card__content">
              <span className="title">Aviyonik Kitler</span>
              <p>Projelerinizde güvenle kullanabileceğiniz yüksek kaliteli aviyonik kitler sunuyoruz. Güvenilir, hassas ve performans odaklı çözümlerimizle uçuş güvenliğinizi ve verimliliğinizi artırın.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Board
