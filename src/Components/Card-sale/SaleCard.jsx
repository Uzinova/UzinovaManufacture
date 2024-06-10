// src/components/SaleCard.js
import React from 'react';

const SaleCard = ({ product }) => {
  return (
    <div key={product.id} className="bg-slate-400 h-[250px] w-[150px] text-black rounded-xl">
    <div className=" flex justify-center items-center">
    <img src={product.image}   alt='' className="h-44 w-44 p-2"/>

    </div>
 
    <div  className='flex flex-col justify-center items-center ' >
      <p>{product.name}</p>
      <p>{product.description}</p>
   
    </div>
  </div>
  );
};

export default SaleCard;
