import React from 'react';
import MenuForm from '../components/MenuForm';
import Navbar from '../components/Navbar';

const CreateMenuPage = () => {
  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4 pt-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">Create New Menu</h1>
        </div>
        <div className="bg-gray-800 bg-opacity-60 backdrop-blur-md rounded-xl shadow-lg overflow-hidden border border-gray-700 p-6 max-w-md mx-auto">
          <MenuForm />
        </div>
      </div>
    </>
  );
};

export default CreateMenuPage;
