import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowRight, FaShoppingCart } from 'react-icons/fa';

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="w-full py-12 px-4 sm:px-6 lg:px-8 bg-[#FFFBF5]">
      <div className="max-w-6xl mx-auto">
        <div 
          className="rounded-3xl px-8 py-16 md:px-16 md:py-20 text-center"
          style={{
            background: 'linear-gradient(135deg, #F7931E 0%, #F26522 50%, #E63946 100%)'
          }}
        >
          {/* Tamil Quote */}
          <p className="text-white/90 text-lg md:text-xl italic mb-4 font-medium">
            "உங்கள் சமையலறைக்கு ஒரு புதிய அனுபவம்."
          </p>
          
          {/* Main Heading */}
          <h2 className="text-white text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Ready to stock your kitchen?
          </h2>
          
          {/* Description */}
          <p className="text-white/90 text-base md:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Browse the full catalog and pay securely with GPay UPI or Razorpay — your order is confirmed instantly.
          </p>
          
          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={() => navigate('/products')}
              className="group bg-white text-[#E63946] px-8 py-4 rounded-full font-semibold text-base hover:bg-gray-100 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              Shop now
              <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
            </button>
            
            <button 
              onClick={() => navigate('/cart')}
              className="group border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-base hover:bg-white hover:text-[#E63946] transition-all duration-300 flex items-center gap-2"
            >
              <FaShoppingCart />
              View cart
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;