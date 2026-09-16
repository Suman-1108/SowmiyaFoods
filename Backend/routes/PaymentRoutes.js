import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { protectStaff } from "../middleware/authMiddleware.js";

const router = express.Router();

// Helper to instantiate Razorpay client
const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error("Razorpay credentials not configured in environment variables.");
  }

  return new Razorpay({ key_id, key_secret });
};

// ✅ Create Razorpay Order API
router.post("/orders", async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ message: "Valid amount is required" });
    }

    const razorpay = getRazorpayInstance();
    const options = {
      amount: Math.round(Number(amount) * 100), // convert to paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    };

    const order = await razorpay.orders.create(options);
    console.log("[Payment] Order Created:", order.id);

    // Return the created order along with the public key_id for frontend checkout
    res.status(200).json({
      ...order,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("[Payment] Order creation error:", err);
    res.status(500).json({
      message: "Error creating Razorpay order",
      error: err.message,
    });
  }
});

// ✅ Razorpay Payment Verification
router.post("/verify", (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        verified: false,
        message: "Missing required payment verification details",
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(500).json({
        verified: false,
        message: "Razorpay secret key not configured on server",
      });
    }

    // ⚡ Generate signature on server
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      console.log("[Payment] Verified successfully for order:", razorpay_order_id);
      return res.status(200).json({ verified: true, message: "Payment verified successfully" });
    } else {
      console.warn("[Payment] Signature mismatch for order:", razorpay_order_id);
      return res.status(400).json({ verified: false, message: "Payment verification failed" });
    }
  } catch (error) {
    console.error("[Payment] Payment verification error:", error);
    res.status(500).json({ verified: false, message: "Server error during payment verification" });
  }
});

// ✅ GET /api/payment/admin/dashboard - Live Razorpay Gateway Transactions & Analytics
router.get("/admin/dashboard", protectStaff, async (req, res) => {
  try {
    const razorpay = getRazorpayInstance();

    // Fetch up to 100 recent payments from Razorpay
    const paymentsData = await razorpay.payments.all({ count: 100 });
    const items = paymentsData.items || [];

    let totalCapturedPaise = 0;
    let totalCapturedCount = 0;
    let totalFailedCount = 0;
    let totalRefundedPaise = 0;
    let totalFeePaise = 0;
    let totalTaxPaise = 0;

    const methodCounts = {};
    const statusCounts = {};

    const formattedTransactions = items.map((p) => {
      const amountInr = Number(p.amount || 0) / 100;
      const feeInr = Number(p.fee || 0) / 100;
      const taxInr = Number(p.tax || 0) / 100;
      const refundedInr = Number(p.amount_refunded || 0) / 100;

      if (p.status === "captured") {
        totalCapturedPaise += Number(p.amount || 0);
        totalCapturedCount++;
        totalFeePaise += Number(p.fee || 0);
        totalTaxPaise += Number(p.tax || 0);
      } else if (p.status === "failed") {
        totalFailedCount++;
      }

      if (p.amount_refunded > 0) {
        totalRefundedPaise += Number(p.amount_refunded);
      }

      const methodKey = (p.method || "other").toLowerCase();
      if (!methodCounts[methodKey]) {
        methodCounts[methodKey] = { count: 0, amountPaise: 0 };
      }
      methodCounts[methodKey].count++;
      if (p.status === "captured") {
        methodCounts[methodKey].amountPaise += Number(p.amount || 0);
      }

      const statusKey = (p.status || "unknown").toLowerCase();
      statusCounts[statusKey] = (statusCounts[statusKey] || 0) + 1;

      return {
        id: p.id,
        orderId: p.order_id || "N/A",
        amount: amountInr,
        fee: feeInr,
        tax: taxInr,
        netAmount: Number((amountInr - feeInr - taxInr).toFixed(2)),
        currency: p.currency || "INR",
        status: p.status,
        method: p.method,
        bank: p.bank || null,
        wallet: p.wallet || null,
        vpa: p.vpa || null,
        email: p.email || "N/A",
        contact: p.contact || "N/A",
        description: p.description || "Order Payment",
        refundedAmount: refundedInr,
        createdAt: new Date((p.created_at || Date.now() / 1000) * 1000).toISOString(),
        errorDescription: p.error_description || null,
      };
    });

    const totalCapturedAmount = Number((totalCapturedPaise / 100).toFixed(2));
    const totalFees = Number((totalFeePaise / 100).toFixed(2));
    const totalTax = Number((totalTaxPaise / 100).toFixed(2));
    const totalRefundedAmount = Number((totalRefundedPaise / 100).toFixed(2));
    const netSettlementAmount = Number(
      (totalCapturedAmount - totalFees - totalTax - totalRefundedAmount).toFixed(2)
    );

    const methodsList = Object.entries(methodCounts).map(([key, val]) => ({
      key,
      name:
        key === "upi"
          ? "UPI (GPay / PhonePe / Paytm)"
          : key === "netbanking"
          ? "Netbanking (SBI, HDFC, ICICI, etc.)"
          : key === "card"
          ? "Credit / Debit Card"
          : key === "wallet"
          ? "Mobile Wallet"
          : key.toUpperCase(),
      count: val.count,
      amount: Number((val.amountPaise / 100).toFixed(2)),
      percentage: items.length > 0 ? Math.round((val.count / items.length) * 100) : 0,
    }));

    // Daily trend from Razorpay captured payments
    const dailyMap = {};
    formattedTransactions
      .filter((t) => t.status === "captured")
      .forEach((t) => {
        const dateKey = t.createdAt.slice(0, 10);
        if (!dailyMap[dateKey]) {
          dailyMap[dateKey] = { date: dateKey, revenue: 0, count: 0 };
        }
        dailyMap[dateKey].revenue += t.amount;
        dailyMap[dateKey].count += 1;
      });

    const dailyTrend = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

    res.status(200).json({
      success: true,
      gateway: {
        keyIdPreview: process.env.RAZORPAY_KEY_ID ? `${process.env.RAZORPAY_KEY_ID.slice(0, 8)}...` : "Configured",
        currency: "INR",
        status: "connected",
      },
      summary: {
        totalCapturedAmount,
        totalCapturedCount,
        totalFailedCount,
        totalRefundedAmount,
        totalFees,
        totalTax,
        netSettlementAmount,
        totalTransactions: items.length,
        successRate: items.length > 0 ? Number(((totalCapturedCount / items.length) * 100).toFixed(1)) : 100,
      },
      methods: methodsList,
      statusBreakdown: statusCounts,
      dailyTrend,
      transactions: formattedTransactions,
    });
  } catch (err) {
    console.error("[Razorpay Dashboard API] Error:", err.message || err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch Razorpay payment data",
      error: err.message,
    });
  }
});

export default router;
