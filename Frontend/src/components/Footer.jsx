import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiPhone, FiInstagram, FiFacebook, FiYoutube, FiMail, FiMapPin } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

const Footer = () => {
  const navigate = useNavigate();

  const shopLinks = [
    { name: "Vermicelli", path: "/category/Vermicelli" },
    { name: "Rava", path: "/category/Rava" },
    { name: "Noodles", path: "/category/Noodles" },
    { name: "Flour", path: "/category/Flour" },
    { name: "All Products", path: "/products" },
  ];

  const socialLinks = [
    {
      name: "Instagram",
      icon: <FiInstagram size={18} />,
      url: "https://www.instagram.com/sowmiyafoods/",
      hoverColor: "hover:bg-pink-500 hover:border-pink-500 hover:text-white",
    },
    {
      name: "Facebook",
      icon: <FiFacebook size={18} />,
      url: "https://www.facebook.com/sowmiyafoods/",
      hoverColor: "hover:bg-blue-600 hover:border-blue-600 hover:text-white",
    },
    {
      name: "YouTube",
      icon: <FiYoutube size={18} />,
      url: "https://www.youtube.com/@sowmiyafoods",
      hoverColor: "hover:bg-red-600 hover:border-red-600 hover:text-white",
    },
    {
      name: "WhatsApp",
      icon: <FaWhatsapp size={18} />,
      url: "https://wa.me/919876543210",
      hoverColor: "hover:bg-green-500 hover:border-green-500 hover:text-white",
    },
  ];

  return (
    <footer className="relative z-20 bg-gradient-to-b from-[#FFF8F0] to-[#FFF5E6] py-16 px-4 sm:px-6 lg:px-8 border-t border-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Column 1 - Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg p-1.5">
                <img 
                  src="/logo.png" 
                  alt="Sowmiya Foods" 
                  className="w-full h-full rounded-lg object-cover"
                />
              </div>
              <div>
                <h3 className="text-[#1e3a5f] font-bold text-xl">Sowmiya Foods</h3>
                <p className="text-amber-600 text-xs tracking-widest uppercase font-semibold">Pure · Fresh · Tasty</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Family-recipe vermicelli, rava, noodles and flour — milled fresh and packed with care for every Indian kitchen.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FiMapPin className="text-amber-500 flex-shrink-0" size={16} />
              <span>Raja Sowmiya Food Products, 4/335, Amman Nagar, Op Station Backside, Sundararajapuram, Rajapalayam, Tamilnadu</span>
            </div>
          </div>

          {/* Column 2 - Shop */}
          <div>
            <h4 className="text-[#1e3a5f] font-bold text-sm mb-5 uppercase tracking-wider flex items-center gap-2">
              <span className="w-8 h-0.5 bg-amber-500"></span>
              Shop
            </h4>
            <ul className="space-y-3">
              {shopLinks.map((item, idx) => (
                <li key={idx}>
                  <Link
                    to={item.path}
                    className="text-gray-600 text-sm hover:text-[#E63946] transition-colors duration-200 inline-flex items-center group"
                  >
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mr-2.5 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Contact */}
          <div>
            <h4 className="text-[#1e3a5f] font-bold text-sm mb-5 uppercase tracking-wider flex items-center gap-2">
              <span className="w-8 h-0.5 bg-amber-500"></span>
              Contact Us
            </h4>
            <div className="space-y-4">
              <a href="tel:7373723241" className="flex items-center gap-3 text-gray-600 text-sm hover:text-[#E63946] transition-colors duration-200 group">
                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                  <FiPhone className="text-amber-600 group-hover:text-white transition-colors" size={16} />
                </div>
                <span>7373723241</span>
              </a>
              <a href="mailto:sowmiyafoods01@gmail.com" className="flex items-center gap-3 text-gray-600 text-sm hover:text-[#E63946] transition-colors duration-200 group">
                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                  <FiMail className="text-amber-600 group-hover:text-white transition-colors" size={16} />
                </div>
                <span>sowmiyafoods01@gmail.com</span>
              </a>
              <button 
                onClick={() => navigate('/contactus')}
                className="inline-flex items-center gap-2 mt-3 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-sm font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <FiPhone size={16} />
                Get in Touch
              </button>
            </div>
          </div>

          {/* Column 4 - Follow Us / Social Media */}
          <div>
            <h4 className="text-[#1e3a5f] font-bold text-sm mb-5 uppercase tracking-wider flex items-center gap-2">
              <span className="w-8 h-0.5 bg-amber-500"></span>
              Follow Us
            </h4>
            <p className="text-gray-600 text-sm leading-relaxed mb-5">
              Stay connected for updates, recipes, and offers!
            </p>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social, idx) => (
                <a
                  key={idx}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={social.name}
                  className={`w-11 h-11 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-gray-500 ${social.hoverColor} transition-all duration-200 hover:scale-110 hover:shadow-lg`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Policy Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            <Link
              to="/terms-and-conditions"
              className="text-gray-500 text-xs hover:text-[#E63946] transition-colors duration-200 font-medium uppercase tracking-wide"
            >
              Terms & Conditions
            </Link>
            <Link
              to="/privacy-policy"
              className="text-gray-500 text-xs hover:text-[#E63946] transition-colors duration-200 font-medium uppercase tracking-wide"
            >
              Privacy Policy
            </Link>
            <Link
              to="/refund-policy"
              className="text-gray-500 text-xs hover:text-[#E63946] transition-colors duration-200 font-medium uppercase tracking-wide"
            >
              Refund Policy
            </Link>
            <Link
              to="/shipping-policy"
              className="text-gray-500 text-xs hover:text-[#E63946] transition-colors duration-200 font-medium uppercase tracking-wide"
            >
              Shipping Policy
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-gray-400 text-xs">
            &copy; {new Date().getFullYear()} Sowmiya Foods. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;