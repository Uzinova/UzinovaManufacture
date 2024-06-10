import React, { useEffect, useRef, useState } from 'react';
 
import SliderZ from '../../Components/Slider/slider';
import ServiceHero from '../../Components/services/services';
import OrderForm from '../../Components/OrderForm/orderform';
import { BrowserRouter as Router, Route, Routes, BrowserRouter } from 'react-router-dom';

import { db } from '../../firebase';
import { collection, getDocs, doc,getDoc,setDoc, addDoc, serverTimestamp, onSnapshot, query, orderBy ,updateDoc} from 'firebase/firestore';
import Cookies from 'js-cookie';
import Offers from '../../Components/Offers/offers';

import AdminPanel from '../../Components/AdminPanel/AdminPanel';
import ProductDetail from '../../Components/Offers/ProductDetail';
import RocketSelecter from './RocketSelecter';
import Maindd from '../MainDropDown/maindd';
import SaleSlider from '../saleSlider/SaleSlider';
import Catagoryslider from '../CatagoryBasedSlider/Catagoryslider';
import Board from '../BULLBOARD/board';
import Ecobord from '../ecobord/Ecobord';
 
function Mainpage() {
 
 

 

  
 
  return (
 
    <div >
    

      <div className='nvbar'></div>

      <div className='hero'>
        <div className='slidercomp'><SliderZ /></div>
        <div className='SerHero'>
       
        
       
       <Ecobord/>
       <Board/>
       <Catagoryslider/>
        <Offers/>
     
        </div>
        
     
     
      </div>
   
       
       

   
    </div>
 
   );
}

export default Mainpage;
