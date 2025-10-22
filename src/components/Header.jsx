import React from 'react';

const Header = () => (
  <header className="absolute top-0 left-0 right-0 z-20 p-6">
    <div className="container mx-auto flex justify-between items-center">
      <h1 className="text-2xl font-bold text-white tracking-wider">Qazaq Mind</h1>
      <a href="#contact" className="btn btn-secondary">Байланыс</a>
    </div>
  </header>
);

export default Header;
