import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Refund Policy</h1>

        <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
          <p className="text-sm text-gray-500 mb-8">Last updated: June 2025</p>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              Returns and Eligibility
            </h2>
            <p className="leading-relaxed">
              At Top Sowmiya Foods Marketing, we take utmost care in delivering high-quality food
              products. Due to the perishable and consumable nature of our products, returns are only
              accepted in cases where the product received is damaged, defective, or incorrect. We do
              not accept returns for reasons such as change of mind, taste preference, or ordering
              errors made by the customer.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              Return Request Process
            </h2>
            <p className="leading-relaxed">
              Customers must raise a return or complaint request within 3 days of delivery by
              contacting our support team. The request must include clear proof such as images or
              videos showing the issue with the product and the packaging. Requests raised after this
              timeframe may not be eligible for review.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              Refund and Replacement
            </h2>
            <p className="leading-relaxed">
              Once the issue is verified, we may offer either a replacement of the product or a
              refund, depending on the situation. Refunds will be processed to the original payment
              method used during purchase.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Refund Timeline</h2>
            <p className="leading-relaxed">
              Approved refunds will be initiated within 5–10 business days after verification. The
              time taken for the amount to reflect in your account may vary depending on your bank or
              payment provider.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              Non-Refundable Situations
            </h2>
            <p className="leading-relaxed">
              We do not provide refunds or replacements in the following cases:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4">
              <li className="leading-relaxed">
                Incorrect shipping address provided by the customer
              </li>
              <li className="leading-relaxed">
                Delivery failed due to customer unavailability; courier will not hold the order
              </li>
              <li className="leading-relaxed">
                Minor packaging variations that do not affect product quality
              </li>
              <li className="leading-relaxed">
                Personal taste preferences or dislike of the product
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              Cancellation Policy
            </h2>
            <p className="leading-relaxed">
              Orders can be cancelled only before they are dispatched. Once the order has been
              shipped, cancellations are not permitted.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Contact Information</h2>
            <p className="leading-relaxed">
              For any refund or return-related queries, contact us at:
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

export default RefundPolicy;