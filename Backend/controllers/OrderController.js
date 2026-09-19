import Order from "../models/Order.js";
import Product from "../models/Product.js";
import nodemailer from "nodemailer";
import { getSmtpTransporter, getFromAddress } from "../config/mailer.js";

const LOGO_URL = process.env.LOGO_URL || "https://sowmiyafoods.com/logo.png";

// =======================
// Create/save a new order
// =======================
export const createOrder = async (req, res) => {
  try {
    const {
      userId,
      products,
      totalAmount,
      deliveryCharge,
      paymentId,
      orderId,
      paymentMethod,
      address,
      customerEmail,
    } = req.body;

    // 1️⃣ Create the order in the database first (include email + paymentMethod)
    const order = await Order.create({
      userId,
      products,
      totalAmount,
      deliveryCharge,
      paymentId,
      orderId,
      paymentMethod: paymentMethod || "Razorpay",
      address,
      customerEmail,
    });

    // Reload order from DB to get full data with defaults
    const fullOrder = await Order.findById(order._id);

    // 2️⃣ Send order email to admin asynchronously (non-blocking)
    sendOrderEmailToAdmin({ order: fullOrder, address }).catch((err) =>
      console.error("Failed to send admin email:", err)
    );

    // 3️⃣ Send order confirmation email to customer asynchronously (non-blocking)
    if (customerEmail) {
      sendOrderEmailToCustomer({ order: fullOrder, address, email: customerEmail }).catch((err) =>
        console.error("Failed to send customer email:", err)
      );
    }

    // 4️⃣ Respond to client immediately
    res.status(201).json(order);
  } catch (err) {
    console.error("Order creation failed:", err);
    res.status(500).json({ message: err.message });
  }
};

// =======================
// Get all orders for a specific user
// =======================
export const getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "UserId is required" });
    }

    const rawOrders = await Order.find({ userId }).sort({ date: -1, createdAt: -1 }).lean();

    // Look for missing images
    const missingProductIds = new Set();
    const missingNames = new Set();
    rawOrders.forEach((o) => {
      (o.products || []).forEach((p) => {
        if (!p.img) {
          if (p.productId) missingProductIds.add(String(p.productId));
          else if (p.name) missingNames.add(p.name);
        }
      });
    });

    let idMap = new Map();
    let nameMap = new Map();

    if (missingProductIds.size > 0 || missingNames.size > 0) {
      const queryOr = [];
      if (missingProductIds.size > 0) {
        queryOr.push({ _id: { $in: Array.from(missingProductIds) } });
      }
      if (missingNames.size > 0) {
        queryOr.push({ name: { $in: Array.from(missingNames) } });
      }

      const dbProducts = await Product.find({ $or: queryOr })
        .select("_id name image")
        .lean();

      dbProducts.forEach((dp) => {
        if (dp._id && dp.image) idMap.set(String(dp._id), dp.image);
        if (dp.name && dp.image) nameMap.set(dp.name, dp.image);
      });

      rawOrders.forEach((o) => {
        (o.products || []).forEach((p) => {
          if (!p.img) {
            if (p.productId && idMap.has(String(p.productId))) {
              p.img = idMap.get(String(p.productId));
            } else if (p.name && nameMap.has(p.name)) {
              p.img = nameMap.get(p.name);
            }
          }
        });
      });
    }

    res.status(200).json({ success: true, orders: rawOrders });
  } catch (err) {
    console.error("Fetching orders failed:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: err.message,
    });
  }
};

// =======================
// Helper: Generate Rich HTML Order Email Template (Mobile-Optimized)
// =======================
const generateOrderEmailHtml = ({ order, address, isAdmin = false }) => {
  const formattedDate = new Date(order.createdAt || order.date || Date.now()).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const itemsSubtotal = (order.products || []).reduce(
    (acc, p) => acc + (Number(p.subtotal) || (Number(p.price || 0) * Number(p.quantity || 1))),
    0
  );
  const deliveryFee = Number(order.deliveryCharge) || 0;
  const totalAmount = Number(order.totalAmount) || (itemsSubtotal + deliveryFee);

  const productsHtml = (order.products || [])
    .map(
      (p, index) => `
      <tr style="border-bottom: 1px solid #F1EAE1; background-color: ${index % 2 === 0 ? '#FFFFFF' : '#FCFAF7'};">
        <td class="product-cell" style="padding: 12px 14px; font-size: 13px; font-weight: 600; color: #1a1a2e;">
          <div style="font-size: 13px; font-weight: 600; color: #1a1a2e; line-height: 1.4;">${p.name || "Food Item"}</div>
          <!-- Mobile subtext: Qty and unit price -->
          <div class="mobile-show" style="display: none; font-size: 11px; font-weight: 500; color: #64748B; margin-top: 3px;">
            Qty: ${p.quantity || 1} &nbsp;·&nbsp; ₹${Number(p.price || 0).toFixed(2)} each
          </div>
        </td>
        <td class="mobile-hide" align="center" style="padding: 12px 14px; font-size: 13px; font-weight: 700; color: #475569; white-space: nowrap;">
          ${p.quantity || 1}
        </td>
        <td class="mobile-hide" align="right" style="padding: 12px 14px; font-size: 13px; color: #64748B; white-space: nowrap;">
          ₹${Number(p.price || 0).toFixed(2)}
        </td>
        <td class="product-total-cell" align="right" style="padding: 12px 14px; font-size: 13px; font-weight: 700; color: #1a1a2e; white-space: nowrap;">
          ₹${Number(p.subtotal || ((p.price || 0) * (p.quantity || 1))).toFixed(2)}
        </td>
      </tr>
    `
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
  <meta name="x-apple-disable-message-reformatting">
  <title>Order Confirmation - Sowmiya Foods</title>
  <style type="text/css">
    /* Base Resets */
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    table {
      border-collapse: collapse !important;
    }
    body {
      height: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
    }

    /* Mobile Responsive Customization */
    @media only screen and (max-width: 600px) {
      .email-outer-td {
        padding: 8px 4px !important;
      }
      .email-container {
        width: 100% !important;
        max-width: 100% !important;
        border-radius: 12px !important;
      }
      .header-cell {
        padding: 22px 16px 16px 16px !important;
      }
      .logo-img {
        width: 68px !important;
        height: 68px !important;
        margin-bottom: 8px !important;
      }
      .brand-title {
        font-size: 20px !important;
        letter-spacing: 0.3px !important;
      }
      .brand-tagline {
        font-size: 11px !important;
        letter-spacing: 1px !important;
      }
      .content-cell {
        padding-left: 14px !important;
        padding-right: 14px !important;
        padding-top: 18px !important;
        padding-bottom: 14px !important;
      }
      .hero-badge {
        font-size: 11px !important;
        padding: 4px 12px !important;
      }
      .hero-title {
        font-size: 18px !important;
        line-height: 1.3 !important;
      }
      .hero-text {
        font-size: 13px !important;
        line-height: 1.5 !important;
      }
      .info-col {
        display: block !important;
        width: 100% !important;
        padding: 6px 0 !important;
        box-sizing: border-box !important;
      }
      .info-table {
        padding: 12px 14px !important;
      }
      .section-heading {
        font-size: 14px !important;
        margin-bottom: 10px !important;
      }
      .mobile-hide {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
        overflow: hidden !important;
        visibility: hidden !important;
        font-size: 0 !important;
        line-height: 0 !important;
      }
      .mobile-show {
        display: block !important;
      }
      .product-cell {
        padding: 10px 10px !important;
      }
      .product-total-cell {
        padding: 10px 10px !important;
        font-size: 13px !important;
      }
      .summary-box {
        padding: 12px 14px !important;
      }
      .address-box {
        padding: 14px !important;
      }
      .next-step-box {
        padding: 12px 14px !important;
      }
      .footer-cell {
        padding: 20px 14px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F7F4EF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #2D3748;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F7F4EF; padding: 24px 10px;">
    <tr>
      <td align="center" class="email-outer-td">
        <!-- Main Container Card -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="email-container" style="max-width: 620px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06); border: 1px solid #EBE4D8;">
          
          <!-- Top Gradient Accent Bar -->
          <tr>
            <td height="6" style="background: linear-gradient(90deg, #E05A1B 0%, #F59E0B 50%, #1a1a2e 100%);"></td>
          </tr>

          <!-- Header with Brand & Logo -->
          <tr>
            <td class="header-cell" style="padding: 28px 24px 20px 24px; text-align: center; background-color: #FFFDF9; border-bottom: 1px solid #F3EDE4;">
              <img src="${LOGO_URL}" alt="Sowmiya Foods Logo" width="80" height="80" class="logo-img" style="display: block; margin: 0 auto 10px auto; border-radius: 50%; border: 2.5px solid #E05A1B; object-fit: contain; background: #ffffff;" />
              <h1 class="brand-title" style="margin: 0; font-size: 24px; font-weight: 800; color: #1a1a2e; letter-spacing: 0.5px;">SOWMIYA FOODS</h1>
              <p class="brand-tagline" style="margin: 4px 0 0 0; font-size: 12px; font-weight: 600; color: #E05A1B; text-transform: uppercase; letter-spacing: 1.5px;">Authentic Traditional Delicacies</p>
            </td>
          </tr>

          <!-- Order Status Banner -->
          <tr>
            <td class="content-cell" style="padding: 24px 24px 16px 24px; text-align: center;">
              <div class="hero-badge" style="display: inline-block; background-color: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 9999px; padding: 5px 16px; margin-bottom: 12px;">
                <span style="color: #065F46; font-size: 12px; font-weight: 700; letter-spacing: 0.5px;">✔ ORDER CONFIRMED &amp; PAID</span>
              </div>
              <h2 class="hero-title" style="margin: 0 0 6px 0; font-size: 20px; font-weight: 700; color: #1a1a2e;">
                ${
                  isAdmin
                    ? "New Customer Order Received!"
                    : `Thank You for Your Order, ${address.fullName || "Valued Customer"}!`
                }
              </h2>
              <p class="hero-text" style="margin: 0; font-size: 14px; line-height: 1.6; color: #64748B;">
                ${
                  isAdmin
                    ? "A new customer order has been paid and received. Details are listed below for fulfillment."
                    : "Your order has been placed successfully. Our team is already preparing your items fresh with genuine traditional care."
                }
              </p>
            </td>
          </tr>

          <!-- Key Info Grid (Stacked on Mobile) -->
          <tr>
            <td class="content-cell" style="padding: 0 24px 18px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="info-table" style="background-color: #FFF9F3; border: 1px solid #F6E7D5; border-radius: 12px; padding: 12px 14px;">
                <tr>
                  <td class="info-col" width="50%" style="vertical-align: top; padding: 5px 8px;">
                    <p style="margin: 0; font-size: 11px; font-weight: 700; color: #9A6A44; text-transform: uppercase; letter-spacing: 0.5px;">Order ID</p>
                    <p style="margin: 3px 0 0 0; font-size: 13px; font-weight: 700; color: #1a1a2e; word-break: break-all; overflow-wrap: anywhere;">${order.orderId || "N/A"}</p>
                  </td>
                  <td class="info-col" width="50%" style="vertical-align: top; padding: 5px 8px;">
                    <p style="margin: 0; font-size: 11px; font-weight: 700; color: #9A6A44; text-transform: uppercase; letter-spacing: 0.5px;">Payment ID</p>
                    <p style="margin: 3px 0 0 0; font-size: 13px; font-weight: 700; color: #1a1a2e; word-break: break-all; overflow-wrap: anywhere;">${order.paymentId || "N/A"}</p>
                  </td>
                </tr>
                <tr>
                  <td class="info-col" width="50%" style="vertical-align: top; padding: 5px 8px;">
                    <p style="margin: 0; font-size: 11px; font-weight: 700; color: #9A6A44; text-transform: uppercase; letter-spacing: 0.5px;">Order Date</p>
                    <p style="margin: 3px 0 0 0; font-size: 13px; font-weight: 600; color: #1a1a2e;">${formattedDate}</p>
                  </td>
                  <td class="info-col" width="50%" style="vertical-align: top; padding: 5px 8px;">
                    <p style="margin: 0; font-size: 11px; font-weight: 700; color: #9A6A44; text-transform: uppercase; letter-spacing: 0.5px;">Payment Method</p>
                    <p style="margin: 3px 0 0 0; font-size: 13px; font-weight: 600; color: #1a1a2e;">${order.paymentMethod || "Razorpay (Online)"}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items Ordered Table -->
          <tr>
            <td class="content-cell" style="padding: 0 24px 18px 24px;">
              <h3 class="section-heading" style="margin: 0 0 12px 0; font-size: 15px; font-weight: 700; color: #1a1a2e; border-left: 4px solid #E05A1B; padding-left: 10px;">
                Items Ordered (${(order.products || []).length})
              </h3>
              
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border: 1px solid #EBE4D8; border-radius: 12px; overflow: hidden; border-collapse: separate;">
                <thead>
                  <tr style="background-color: #FDF9F4;">
                    <th align="left" style="padding: 10px 14px; font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; border-bottom: 1px solid #EBE4D8;">Item</th>
                    <th class="mobile-hide" align="center" style="padding: 10px 14px; font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; border-bottom: 1px solid #EBE4D8;">Qty</th>
                    <th class="mobile-hide" align="right" style="padding: 10px 14px; font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; border-bottom: 1px solid #EBE4D8;">Price</th>
                    <th align="right" style="padding: 10px 14px; font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; border-bottom: 1px solid #EBE4D8;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${productsHtml}
                </tbody>
              </table>

              <!-- Receipt Summary Box (No Colspan Issue on Mobile) -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="summary-box" style="margin-top: 10px; background-color: #FAFAF9; border: 1px solid #EBE4D8; border-radius: 12px; padding: 12px 14px;">
                <tr>
                  <td style="padding: 3px 0; font-size: 13px; color: #64748B;">Items Subtotal</td>
                  <td align="right" style="padding: 3px 0; font-size: 13px; font-weight: 600; color: #1a1a2e; white-space: nowrap;">₹${itemsSubtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 3px 0; font-size: 13px; color: #64748B;">Delivery Fee</td>
                  <td align="right" style="padding: 3px 0; font-size: 13px; font-weight: 600; color: #1a1a2e; white-space: nowrap;">${deliveryFee > 0 ? `₹${deliveryFee.toFixed(2)}` : 'FREE'}</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding: 6px 0 0 0; border-top: 1px dashed #E2D9CC;"></td>
                </tr>
                <tr>
                  <td style="padding: 6px 0 2px 0; font-size: 14px; font-weight: 800; color: #1a1a2e;">Total Amount Paid</td>
                  <td align="right" style="padding: 6px 0 2px 0; font-size: 17px; font-weight: 800; color: #E05A1B; white-space: nowrap;">₹${totalAmount.toFixed(2)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Delivery Address Card -->
          <tr>
            <td class="content-cell" style="padding: 0 24px 18px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="address-box" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 14px 16px;">
                <tr>
                  <td>
                    <h4 style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #1a1a2e; text-transform: uppercase; letter-spacing: 0.5px;">
                      📍 Delivery Address
                    </h4>
                    <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 700; color: #1a1a2e;">${address.fullName || "Customer"}</p>
                    <p style="margin: 0 0 6px 0; font-size: 13px; line-height: 1.5; color: #475569;">
                      ${address.address || ""}${address.city ? `, ${address.city}` : ""}${address.state ? `, ${address.state}` : ""} - <strong>${address.pincode || ""}</strong>
                    </p>
                    <p style="margin: 0; font-size: 13px; color: #64748B;">
                      📞 Phone: <a href="tel:${address.phone || ''}" style="color: #1a1a2e; font-weight: 700; text-decoration: none;">+91 ${address.phone || "Not provided"}</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Reassurance / Next Steps (Customer only) -->
          ${
            !isAdmin
              ? `
          <tr>
            <td class="content-cell" style="padding: 0 24px 22px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="next-step-box" style="background-color: #FFF8F0; border-left: 4px solid #F59E0B; border-radius: 0 12px 12px 0; padding: 12px 16px;">
                <tr>
                  <td>
                    <p style="margin: 0; font-size: 13px; font-weight: 700; color: #92400E;">📦 What Happens Next?</p>
                    <p style="margin: 4px 0 0 0; font-size: 12px; line-height: 1.5; color: #78350F;">
                      We are freshly packing your order. As soon as your parcel is dispatched with our courier partner, we will share the tracking number with you.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          `
              : ""
          }

          <!-- Footer -->
          <tr>
            <td class="footer-cell" style="padding: 22px 24px; text-align: center; background-color: #1a1a2e; color: #E2E8F0; border-top: 1px solid #2D3748;">
              <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 700; color: #FFFFFF; letter-spacing: 0.5px;">SOWMIYA FOODS</h4>
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #94A3B8;">Tradition in every bite • Pure &amp; Authentic</p>
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #CBD5E1;">
                Questions? Reach us at <a href="mailto:${process.env.EMAIL_USER}" style="color: #F59E0B; text-decoration: none; font-weight: 600;">${process.env.EMAIL_USER}</a>
              </p>
              <p style="margin: 8px 0 0 0; font-size: 11px; color: #64748B;">
                © ${new Date().getFullYear()} Sowmiya Foods. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

// =======================
// Send order details to admin
// =======================
export const sendOrderEmailToAdmin = async ({ order, address }) => {
  try {
    const transporter = getSmtpTransporter();
    const fromAddress = getFromAddress();

    const emailHtml = generateOrderEmailHtml({ order, address, isAdmin: true });

    await transporter.sendMail({
      from: fromAddress,
      to: process.env.ADMIN_EMAIL,
      subject: `🔔 New Order Received - ${order.orderId} (₹${order.totalAmount})`,
      html: emailHtml,
    });

    console.log("Order email sent to admin successfully!");
  } catch (err) {
    console.error("Failed to send order email to admin:", err);
  }
};

// =======================
// Send order confirmation to customer
// =======================
export const sendOrderEmailToCustomer = async ({ order, address, email }) => {
  try {
    const transporter = getSmtpTransporter();
    const fromAddress = getFromAddress();

    const emailHtml = generateOrderEmailHtml({ order, address, isAdmin: false });

    await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject: `Order Confirmation: ${order.orderId} | Sowmiya Foods`,
      html: emailHtml,
    });

    console.log("Order confirmation email sent to customer successfully!");
  } catch (err) {
    console.error("Failed to send order confirmation email to customer:", err);
  }
};

// =======================
// Update order status & tracking number (Admin only)
// =======================
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber } = req.body;

    const updateFields = {};
    if (status) updateFields.status = status;
    if (trackingNumber !== undefined) updateFields.trackingNumber = trackingNumber;

    const order = await Order.findByIdAndUpdate(id, updateFields, { new: true });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order updated successfully", order });
  } catch (err) {
    console.error("Failed to update order:", err);
    res.status(500).json({ message: "Failed to update order" });
  }
};

// =======================
// =======================
// Get all orders (Admin only)
// =======================
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1, date: -1 }).lean();

    // Collect product IDs that might lack category
    const missingProductIds = [];
    orders.forEach((o) => {
      (o.products || []).forEach((p) => {
        if (p.productId && !p.category) {
          missingProductIds.push(p.productId);
        }
      });
    });

    if (missingProductIds.length > 0) {
      const dbProducts = await Product.find({ _id: { $in: missingProductIds } })
        .select("category name")
        .lean();
      const catMap = {};
      dbProducts.forEach((dp) => {
        catMap[String(dp._id)] = dp.category;
      });

      orders.forEach((o) => {
        (o.products || []).forEach((p) => {
          if (!p.category && p.productId && catMap[String(p.productId)]) {
            p.category = catMap[String(p.productId)];
          }
        });
      });
    }

    res.status(200).json(orders);
  } catch (err) {
    console.error("Fetching all orders failed:", err);
    res.status(500).json({ message: "Failed to fetch all orders" });
  }
};

// =======================
// Get single order by ID (Admin)
// =======================
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).lean();
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const missingProductIds = (order.products || [])
      .filter((p) => p.productId && !p.category)
      .map((p) => p.productId);

    if (missingProductIds.length > 0) {
      const dbProducts = await Product.find({ _id: { $in: missingProductIds } })
        .select("category name")
        .lean();
      const catMap = {};
      dbProducts.forEach((dp) => {
        catMap[String(dp._id)] = dp.category;
      });

      (order.products || []).forEach((p) => {
        if (!p.category && p.productId && catMap[String(p.productId)]) {
          p.category = catMap[String(p.productId)];
        }
      });
    }

    res.status(200).json(order);
  } catch (err) {
    console.error("Fetching order details failed:", err);
    res.status(500).json({ message: "Failed to fetch order details" });
  }
};
// Delete order by admin
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await Order.findByIdAndDelete(id);
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (err) {
    console.error("Failed to delete order:", err);
    res.status(500).json({ message: "Failed to delete order" });
  }
};

