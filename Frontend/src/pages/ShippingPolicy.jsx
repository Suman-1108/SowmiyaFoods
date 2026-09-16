import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ShippingPolicy = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Shipping Policy</h1>

        <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
          <p className="text-sm text-gray-500 mb-8">Last updated: June 2025</p>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Shipping Coverage</h2>
            <p className="leading-relaxed">
              We currently deliver orders across India. At present, international shipping is not
              available on our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Order Processing</h2>
            <p className="leading-relaxed">
              All orders are processed within 1–3 business days from the time of order confirmation.
              Orders placed on weekends or public holidays will be processed on the next working day.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Delivery Timeline</h2>
            <p className="leading-relaxed">
              Once dispatched, orders are typically delivered within 3–7 business days, depending on
              the delivery location and courier partner. Delivery timelines are indicative and may
              vary due to unforeseen circumstances such as weather conditions, logistics delays, or
              high order volumes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Shipping Charges</h2>
            <p className="leading-relaxed">
              Shipping charges, if applicable, will be calculated and displayed at checkout. Free
              shipping may be offered on selected products or promotional campaigns.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Order Tracking</h2>
            <p className="leading-relaxed">
              After your order is shipped, a tracking link will be shared via SMS or email, allowing
              you to monitor your shipment status.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              Delivery Responsibility
            </h2>
            <p className="leading-relaxed">
              While we partner with reliable courier services, delays or issues caused by third-party
              logistics providers are beyond our direct control. However, we will assist customers in
              resolving such issues wherever possible.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Incorrect Address</h2>
            <p className="leading-relaxed">
              Customers are responsible for providing accurate and complete shipping details. We are
              not liable for delays, losses, or failed deliveries due to incorrect or incomplete
              address information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Contact Information</h2>
            <p className="leading-relaxed">
              For any shipping-related queries or support, please contact us:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg mt-4">
              <p className="font-medium text-gray-900">Email: sowmiyafoods01@gmail.com</p>
              <p className="font-medium text-gray-900">Phone: 7373723241</p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ShippingPolicy;