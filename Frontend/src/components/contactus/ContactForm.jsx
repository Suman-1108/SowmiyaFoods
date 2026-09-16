import React, { useState } from "react";
import toast from "react-hot-toast";
import { Send, User, MapPin, Phone, HelpCircle, MessageSquare, Wheat } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await axiosInstance.post("/contact", formData);
      toast.success(res.data?.message || "Message sent successfully!");
      setFormData({
        name: "",
        address: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputFields = [
    { name: "name", label: "Your Name", type: "text", icon: User, placeholder: "Enter your full name", required: true },
    { name: "address", label: "Address", type: "text", icon: MapPin, placeholder: "Enter your address", required: false },
    { name: "phone", label: "Phone Number", type: "tel", icon: Phone, placeholder: "Enter your phone number", required: false },
    { name: "subject", label: "Subject", type: "text", icon: HelpCircle, placeholder: "What is this about?", required: false },
  ];

  return (
    <div className="relative py-16 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="h-px w-12 bg-amber-400" />
              <Wheat className="w-6 h-6 text-amber-600" />
              <div className="h-px w-12 bg-amber-400" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-amber-900 mb-4">
              Get In Touch
            </h2>
            <p className="text-amber-700 max-w-2xl mx-auto">
              Have questions or feedback? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          {/* Form Card */}
          <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-amber-100">
            {/* Decorative wheat pattern on top */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400" />
            
            <div className="p-8 md:p-12">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Input Fields Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {inputFields.map((field) => (
                    <div key={field.name} className="group">
                      <label className="block text-amber-900 font-medium mb-2 flex items-center gap-2">
                        <field.icon className="w-4 h-4 text-amber-500" />
                        {field.label}
                        {field.required && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type={field.type}
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        className="w-full bg-amber-50/50 border-2 border-amber-100 rounded-xl p-3 pl-4 focus:outline-none focus:border-amber-400 focus:bg-white transition-all duration-300 placeholder:text-gray-400"
                        required={field.required}
                      />
                    </div>
                  ))}
                </div>

                {/* Message Field */}
                <div className="group">
                  <label className="block text-amber-900 font-medium mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-amber-500" />
                    Your Message
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    placeholder="Tell us how we can help you..."
                    className="w-full bg-amber-50/50 border-2 border-amber-100 rounded-xl p-4 focus:outline-none focus:border-amber-400 focus:bg-white transition-all duration-300 placeholder:text-gray-400 resize-none"
                    required
                  ></textarea>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl py-4 px-8 hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Trust indicators */}
              <div className="mt-8 pt-6 border-t border-amber-100">
                <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Secure & Encrypted
                  </span>
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Quick Response
                  </span>
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    24/7 Support
                  </span>
                </div>
              </div>
            </div>

            {/* Decorative corner wheat */}
            <div className="absolute bottom-0 right-0 w-24 h-24 opacity-10 pointer-events-none">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <g transform="translate(80, 20) rotate(45)">
                  <ellipse cx="0" cy="-20" rx="4" ry="12" fill="#D4A574" />
                  <ellipse cx="0" cy="0" rx="5" ry="15" fill="#C9A86C" />
                  <ellipse cx="0" cy="20" rx="5" ry="15" fill="#C9A86C" />
                  <ellipse cx="0" cy="40" rx="4" ry="12" fill="#D4A574" />
                  <line x1="0" y1="-30" x2="0" y2="50" stroke="#B8956A" strokeWidth="2" />
                </g>
              </svg>
            </div>
          </div>

          {/* Alternative contact info */}
          <div className="mt-12 grid md:grid-cols-3 gap-6 text-center">
            <div className="p-6 rounded-xl bg-white/60 backdrop-blur-sm border border-amber-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
                <Phone className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-semibold text-amber-900 mb-1">Phone Support</h3>
              <p className="text-gray-600 text-sm">7373723241</p>
            </div>
            <div className="p-6 rounded-xl bg-white/60 backdrop-blur-sm border border-amber-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-amber-900 mb-1">Email Us</h3>
              <p className="text-gray-600 text-sm">sowmiyafoods01@gmail.com</p>
            </div>
            <div className="p-6 rounded-xl bg-white/60 backdrop-blur-sm border border-amber-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-semibold text-amber-900 mb-1">Visit Us</h3>
              <p className="text-gray-600 text-sm">Raja Sowmiya Food Products, 4/335, Amman Nagar, Op Station Backside, Sundararajapuram, Rajapalayam, Tamilnadu</p>
            </div>
          </div>
        </div>
      </div>

      {/* Background decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-amber-300 rounded-full opacity-10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-orange-300 rounded-full opacity-10 blur-3xl pointer-events-none" />
    </div>
  );
};

export default ContactForm;