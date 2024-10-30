import React, { useState, useEffect } from 'react';
import { Droplet, Leaf, Sparkles, ShoppingCart, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const categories = [
  { id: 'all', name: 'All' },
  { id: 'water', name: 'Water', icon: Droplet },
  { id: 'juice', name: 'Juices', icon: Leaf },
  { id: 'smoothie', name: 'Smoothies', icon: Sparkles },
];

const menuItems = [
  {
    id: 1,
    name: 'Ionized Alkaline Water',
    description: 'Pure, ionized water with balanced pH levels for optimal hydration',
    category: 'water',
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?ixlib=rb-4.0.3&auto=format&fit=crop&q=80',
    benefits: ['Enhanced hydration', 'Balanced pH levels', 'Detoxifying properties'],
    price: 2.99,
    status: 'available',
  },
  {
    id: 2,
    name: 'Natural Flavored Water',
    description: 'Pure water infused with natural fruit essences',
    category: 'water',
    image: 'https://images.unsplash.com/photo-1559839914-17aae19cec71?ixlib=rb-4.0.3&auto=format&fit=crop&q=80',
    benefits: ['Zero calories', 'Natural flavors', 'Refreshing taste'],
    price: 3.49,
    status: 'coming_soon',
  },
  {
    id: 3,
    name: 'Natural Green Juice',
    description: 'Blend of fresh leafy greens and natural ingredients',
    category: 'juice',
    image: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?ixlib=rb-4.0.3&auto=format&fit=crop&q=80',
    benefits: ['Rich in nutrients', 'Immune boosting', 'Natural energy'],
    price: 49,
    status: 'sold_out',
  },
  {
    id: 4,
    name: 'Natural Fruit Juice',
    description: 'Freshly pressed seasonal fruits',
    category: 'juice',
    image: 'https://i.ibb.co/8mkJChX/natural-fruit-drink.jpg" ',
    benefits: ['Vitamin rich', 'No added sugar', 'Fresh taste'],
    price: 39,
    status: 'coming_soon',
  },
  {
    id: 5,
    name: 'Super Foods Dry Fruits Smoothie',
    description: 'Nutrient-dense blend with organic dry fruits',
    category: 'smoothie',
    image: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?ixlib=rb-4.0.3&auto=format&fit=crop&q=80',
    benefits: ['Protein rich', 'Natural sweetness', 'Sustained energy'],
    price: 59,
    status: 'available',
  }
];

export default function Menu() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Trigger fade-in animation on mount
    setIsMounted(true);
  }, []);

  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const handleBuyNow = (item: typeof menuItems[0]) => {
    addToCart(item);
    navigate('/checkout');
  };

  // Currency formatter for Indian Rupees
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  });

  return (
    <div
      id="menu"
      className={`bg-white py-24 sm:py-32 transition-opacity duration-1000 ${isMounted ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Our 100% Organic Menu
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Discover our selection of natural and organic beverages, carefully crafted for your wellness journey.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mt-8 flex justify-center gap-4 flex-nowrap overflow-hidden">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 transform hover:scale-105 hover:shadow-lg ${
                selectedCategory === category.id
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={{ willChange: 'transform' }}
            >
              {category.icon && <category.icon className="w-4 h-4 mr-2" />}
              {category.name}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              className={`group relative bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 transition-transform transition-opacity duration-500 transform ${
                isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              } hover:shadow-lg hover:scale-105`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="aspect-h-9 aspect-w-16 overflow-hidden rounded-t-2xl">
                <img
                  src={item.image}
                  alt={item.name}
                  className="object-cover w-full h-48 transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold leading-8 tracking-tight text-gray-900">
                  {item.name}
                </h3>
                <p className="mt-2 text-sm leading-7 text-gray-600">
                  {item.description}
                </p>
                
                {/* Price Display */}
                <p className="mt-4 text-xl font-bold text-gray-800">
                  {formatter.format(item.price)}
                </p>

                <ul className="mt-4 space-y-2">
                  {item.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-600">
                      <Leaf className="h-4 w-4 text-green-500 mr-2" />
                      {benefit}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex space-x-2">
                  {item.status === 'available' && (
                    <>
                      <button
                        onClick={() => addToCart(item)}
                        className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 transition transform hover:scale-105 duration-300"
                      >
                        Add to Cart
                        <ShoppingCart className="ml-2 h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleBuyNow(item)}
                        className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition transform hover:scale-105 duration-300"
                      >
                        Buy Now
                        <ShoppingBag className="ml-2 h-4 w-4" />
                      </button>
                    </>
                  )}
                  {item.status === 'coming_soon' && (
                    <button
                      disabled
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-yellow-100 cursor-not-allowed transition opacity-75"
                    >
                      Coming Soon
                    </button>
                  )}
                  {item.status === 'sold_out' && (
                    <button
                      disabled
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-red-100 cursor-not-allowed transition opacity-75"
                    >
                      Sold Out
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

