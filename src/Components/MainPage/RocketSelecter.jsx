import React, { useEffect, useRef, useState } from 'react';
import Nosehero from '../../Components/NoseHero/nosehero';



function RocketSelecter() {
    const noseRef = useRef(null);
const [activePart, setActivePart] = useState(null);
useEffect(() => {
    if (activePart === 'nose' && noseRef.current) {
      noseRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activePart]);

  const handlePartClick = (part) => {
    setActivePart(part);
  };
  return (
    <div className='mainhero'>

    <div className='hero-img'>
      <div className="rocketnoseimg col-md-4" onClick={() => handlePartClick('nose')}>
        <svg     width= "100%"
    height="auto" id="Layer_2" data-name="Layer 2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 51 181.45">
          <defs>
            <style>
              {`
                .cls-11 { fill:#b3b3b3; }
                .cls-21 { fill: #6d6c6c; }
                .cls-21, .cls-3 { stroke-width: 0px; }
                .cls-31 { fill: #4d4d4d; }
                .active { stroke: rgb(255, 255, 255); stroke-width: 2; }
              `}
            </style>
          </defs>
          <g id="NoseColor">
            <path className={`cls-11 ${activePart === 'nose' ? 'active' : ''}`} d="M28.35,14.33l-7.57.12c1.47-5.81,2.78-10.61,3.72-14,1.29,4.35,2.56,8.84,3.85,13.88Z" />
            <path className={`cls-31 ${activePart === 'nose' ? 'active' : ''}`} d="M51,181.45H.08c-.55-25.23,1.84-57.68,6.23-90.21C11.79,50.65,18.78,22.05,20.7,14.57c.01-.04.02-.08.03-.12l7.71-.12c4.13,16.72,7.93,34.44,11.19,53.12,7.21,41.33,10.47,79.67,11.37,114Z" />
          </g>
        </svg>
      </div>
      <div className='rocketbodyimg  col-md-4' onClick={() => handlePartClick('body')}>
        <svg    width= "100%"
    height="auto" id="Layer_2" data-name="Layer 2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 51.32 791.49">
          <defs>
            <style>
              {`
                .cls-12 { fill: #999; }
                .cls-22 { fill: #a08307; }
                .cls-32 { fill: #6d6c6c; }
                .cls-42 { fill: #4d4d4d; }
                .active { stroke: rgb(255, 255, 255); stroke-width: 2; }
              `}
            </style>
          </defs>
          <g id="Body">
            <rect className={`cls-42 ${activePart === 'body' ? 'active' : ''}`} x=".32" width="51" height="777" />
            <ellipse className="cls-42" cx="25.81" cy="776" rx="25.49" ry="3.5" />
            <path className="cls-12" d="M51.32,784.65c0,1.52-6.46,2.81-15.65,3.35-3.03.19-6.35.29-9.84.29-3.9,0-7.6-.13-10.9-.35-8.63-.58-14.6-1.83-14.6-3.29v-8.65c-.01,1.93,11.4,3.5,25.48,3.5s25.5-1.57,25.5-3.5v8.65Z" />
            <path className="cls-22" d="M35.67,788.02c-.82,1.97-5.14,3.47-10.35,3.47s-9.65-1.54-10.39-3.55c3.3.31,7,.49,10.9.49,3.49,0,6.81-.14,9.84-.4Z" />
          </g>
        </svg>
      </div>
      <div className='rocketfinsimg col-xs-4 col-s-4 col-md-4' onClick={() => handlePartClick('fins')}>
        <svg     width= "100%"
    height="auto" id="Layer_2" data-name="Layer 2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140.99 80.04">
          <defs>
            <style>
              {`
                .cls-13 { fill:#201636; stroke: #000; stroke-miterlimit: 10; }
                .active { stroke: rgb(255, 255, 255); stroke-width: 2; }
              `}
            </style>
          </defs>
          <g id="FINS">
            <polygon className={`cls-13 ${activePart === 'fins' ? 'active' : ''}`} points="45.01 .97 44.5 79.36 .5 65.78 .5 26.36 45.01 .97" />
            <polygon className={`cls-13 ${activePart === 'fins' ? 'active' : ''}`} points="95.98 .86 96.49 79.25 140.49 65.67 140.49 26.25 95.98 .86" />
            <polygon className={`cls-13 ${activePart === 'fins' ? 'active' : ''}`} points="70.98 .86 70.96 79.25 69 65.67 69 26.25 70.98 .86" />
          </g>
        </svg>
      </div>
    </div>

    <div className='info'>
      {activePart === 'nose' && (
        <div className='info-text'>
          <div className='frame' ref={noseRef}>
            <Nosehero />
          </div>
        </div>
      )}
      {activePart === 'body' && <div className='info-text'>Information about the body of the rocket...</div>}
      {activePart === 'fins' && <div className='info-text'>Information about the fins of the rocket...</div>}
    </div>
  </div>
  )
}

export default RocketSelecter