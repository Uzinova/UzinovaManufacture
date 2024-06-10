import React, { useState } from 'react';
import './Navbar.css';

function Navbar() {
    const [menu, setMenu] = useState('Kompozit');

    return (
        <div className='navbar'>
            <ul className='nav-menu'>
                <li 
                    onClick={() => setMenu('Kompozit')} 
                    className={menu === 'Kompozit' ? 'active' : ''}
                >
                    Kompozit 
                    {menu === 'Kompozit' ? <hr /> : <></>}
                </li>
                <li 
                    onClick={() => setMenu('Gövde')} 
                    className={menu === 'Gövde' ? 'active' : ''}
                >
                    Gövde 
                    {menu === 'Gövde' ? <hr /> : <></>}
                </li>
                <li 
                    onClick={() => setMenu('Kanat')} 
                    className={menu === 'Kanat' ? 'active' : ''}
                >
                    Kanat 
                    {menu === 'Kanat' ? <hr /> : <></>}
                </li>
            </ul>
        </div>
    );
}

export default Navbar;
