import React, { useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LocationMap from "../components/contactus/LocationMap";
import ContactForm from "../components/contactus/ContactForm";
import GrainParticles from "../components/aboutus/GrainParticles";
const ContactUs = () => {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // optional, smooth scrolling
    });
  }, []); // add empty dependency array so it runs only once on mount

  return (
    <div className="relative overflow-hidden">
      <Navbar />
      
      {/* Floating Grain Particles Background */}
      <GrainParticles />
      
      {/* Main Content */}
      <main className="relative z-10">
        <LocationMap />
        <ContactForm />
      </main>

      <Footer />
    </div>
  );
};

export default ContactUs;