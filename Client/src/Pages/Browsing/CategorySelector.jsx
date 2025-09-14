'use client';

import { useState } from 'react';

const CategorySelector = ({ categories }) => {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.name);

  return (
    <div className="flex items-center space-x-3 overflow-x-auto scrollbar-hide">
      {categories.map((category) => (
        <button
          key={category?.name}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
            activeCategory === category?.name
              ? 'bg-black text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
          }`}
          onClick={() => setActiveCategory(category?.name)}
        >
          {category?.name}
        </button>
      ))}
    </div>
  );
};

export default CategorySelector;
