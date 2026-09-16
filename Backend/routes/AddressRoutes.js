import express from "express";
import {
  createAddress,
  getAddressesByUser,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/AddressController.js";

const router = express.Router();

// POST → Save address
router.post("/", createAddress);

// GET → Get all addresses by userId
router.get("/:userId", getAddressesByUser);

// PUT → Update address by id
router.put("/:id", updateAddress);

// DELETE → Delete address by id
router.delete("/:id", deleteAddress);

// PUT → Set address as default
router.put("/:id/default", setDefaultAddress);

export default router;
