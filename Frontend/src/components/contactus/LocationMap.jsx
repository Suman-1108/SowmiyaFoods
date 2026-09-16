import React from "react";
import { MapPin, Navigation, Phone, Mail, Clock } from "lucide-react";

const LocationMap = () => {
  return (
    <div className="relative py-16 overflow-hidden">
      {/* Decorative wheat corners */}
      <div className="absolute top-0 left-0 w-32 h-32 opacity-20">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {[...Array(3)].map((_, i) => (
            <g key={i} transform={`translate(${20 + i * 25}, 80) rotate(${-30 + i * 15})`}>
              <ellipse cx="0" cy="-20" rx="4" ry="12" fill="#D4A574" />
              <ellipse cx="0" cy="0" rx="5" ry="15" fill="#C9A86C" />
              <ellipse cx="0" cy="20" rx="4" ry="12" fill="#D4A574" />
              <line x1="0" y1="-30" x2="0" y2="30" stroke="#B8956A" strokeWidth="2" />
            </g>
          ))}
        </svg>
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 opacity-20 rotate-90">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {[...Array(3)].map((_, i) => (
            <g key={i} transform={`translate(${20 + i * 25}, 80) rotate(${-30 + i * 15})`}>
              <ellipse cx="0" cy="-20" rx="4" ry="12" fill="#D4A574" />
              <ellipse cx="0" cy="0" rx="5" ry="15" fill="#C9A86C" />
              <ellipse cx="0" cy="20" rx="4" ry="12" fill="#D4A574" />
              <line x1="0" y1="-30" x2="0" y2="30" stroke="#B8956A" strokeWidth="2" />
            </g>
          ))}
        </svg>
      </div>

      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="h-px w-12 bg-amber-400" />
            <MapPin className="w-6 h-6 text-amber-600" />
            <div className="h-px w-12 bg-amber-400" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-amber-900 mb-4">
            Visit Us
          </h2>
          <p className="text-amber-700 max-w-2xl mx-auto">
            We welcome you to visit our facility and experience the essence of traditional South Indian food products
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-amber-200">
              <iframe
                title="Sowmiya Foods Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1967.987593258764!2d77.5031405039231!3d9.423578503138101!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b06e90052dece55%3A0x11efb02f3717e12b!2sSOWMIYA%20FOODS!5e0!3m2!1sen!2sin!4v1760003760143!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "450px" }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
              
              {/* Map Overlay Badge */}
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-amber-200">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-amber-900 font-medium text-sm">Open Now</span>
                </div>
              </div>
            </div>
          </div>

          {/* Company Info Section */}
          <div className="space-y-6">
            {/* Main Info Card */}
            <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-amber-100 hover:shadow-2xl transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Navigation className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-amber-900">Sowmiya Foods</h3>
                  <p className="text-amber-600 text-sm">Ramar Brand</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex gap-3">
                  <MapPin className="w-5 h-5 text-amber-500 flex-shrink-0 mt-1" />
                  <p className="text-gray-700">
                    No. 12, Main Road<br />
                    Raja Sowmiya Food Products, 4/335, Amman Nagar, Op Station Backside, Sundararajapuram, Rajapalayam, Tamilnadu<br />
                    India - 626125
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <Phone className="w-5 h-5 text-amber-500 flex-shrink-0 mt-1" />
                  <p className="text-gray-700">+91 7373723241</p>
                </div>
                
                <div className="flex gap-3">
                  <Mail className="w-5 h-5 text-amber-500 flex-shrink-0 mt-1" />
                  <p className="text-gray-700">sowmiyafoods01@gmail.com</p>
                </div>
                
                <div className="flex gap-3">
                  <Clock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-1" />
                  <div className="text-gray-700">
                    <p className="font-medium">Business Hours:</p>
                    <p>Mon - Sat: 9:00 AM - 6:00 PM</p>
                    <p>Sunday: Closed</p>
                  </div>
                </div>
              </div>

              <a
                href="https://maps.app.goo.gl/kQmRaAzSQBB85r65A"
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-6"
              >
                <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg font-medium group">
                  <Navigation className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  View on Google Maps
                </button>
              </a>
            </div>

            {/* Quick Contact Card */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
              <h4 className="font-bold text-amber-900 mb-3">Quick Contact</h4>
              <p className="text-gray-600 text-sm mb-4">
                Have questions? Reach out to us directly for quick assistance.
              </p>
              <a 
                href="tel:+919876543210"
                className="inline-flex items-center gap-2 text-amber-700 font-medium hover:text-amber-800 transition-colors"
              >
                <Phone className="w-4 h-4" />
                Call us now
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative gradient orbs */}
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-amber-300 rounded-full opacity-20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-orange-300 rounded-full opacity-20 blur-3xl pointer-events-none" />
    </div>
  );
};

export default LocationMap;