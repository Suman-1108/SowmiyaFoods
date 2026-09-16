// controllers/AddressController.js
import Address from "../models/Address.js";

// POST → Save new address
export const createAddress = async (req, res) => {
  try {
    const { userId, fullName, phone, address, city, state, pincode, landmark, type, isDefault } = req.body;

    if (!fullName || !phone || !address || !city || !state || !pincode) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    // If marked default or first address for this user, handle isDefault
    const count = await Address.countDocuments({ userId });
    const shouldBeDefault = isDefault || count === 0;

    if (shouldBeDefault && userId) {
      await Address.updateMany({ userId }, { isDefault: false });
    }

    const newAddress = new Address({
      userId,
      fullName: fullName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      landmark: landmark ? landmark.trim() : "",
      type: type || "Home",
      isDefault: shouldBeDefault,
    });

    await newAddress.save();
    res.status(201).json(newAddress);
  } catch (err) {
    console.error("Error saving address:", err);
    res.status(500).json({ message: "Server error saving address" });
  }
};

// GET → Get all addresses for a user
export const getAddressesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const addresses = await Address.find({ userId }).sort({ isDefault: -1, createdAt: -1 });
    res.status(200).json(addresses);
  } catch (err) {
    console.error("Error fetching addresses:", err);
    res.status(500).json({ message: "Server error fetching addresses" });
  }
};

// PUT → Update an existing address
export const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, phone, address, city, state, pincode, landmark, type, isDefault } = req.body;

    const existingAddress = await Address.findById(id);
    if (!existingAddress) {
      return res.status(404).json({ message: "Address not found" });
    }

    if (isDefault && existingAddress.userId) {
      await Address.updateMany({ userId: existingAddress.userId }, { isDefault: false });
    }

    const updated = await Address.findByIdAndUpdate(
      id,
      {
        fullName: fullName ? fullName.trim() : existingAddress.fullName,
        phone: phone ? phone.trim() : existingAddress.phone,
        address: address ? address.trim() : existingAddress.address,
        city: city ? city.trim() : existingAddress.city,
        state: state ? state.trim() : existingAddress.state,
        pincode: pincode ? pincode.trim() : existingAddress.pincode,
        landmark: landmark !== undefined ? landmark.trim() : existingAddress.landmark,
        type: type || existingAddress.type,
        isDefault: isDefault !== undefined ? isDefault : existingAddress.isDefault,
      },
      { new: true }
    );

    res.status(200).json(updated);
  } catch (err) {
    console.error("Error updating address:", err);
    res.status(500).json({ message: "Server error updating address" });
  }
};

// DELETE → Delete an address
export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Address.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Address not found" });
    }
    res.status(200).json({ message: "Address deleted successfully" });
  } catch (err) {
    console.error("Error deleting address:", err);
    res.status(500).json({ message: "Server error deleting address" });
  }
};

// PUT → Set address as default
export const setDefaultAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const address = await Address.findById(id);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    if (address.userId) {
      await Address.updateMany({ userId: address.userId }, { isDefault: false });
    }

    address.isDefault = true;
    await address.save();

    res.status(200).json({ message: "Default address set successfully", address });
  } catch (err) {
    console.error("Error setting default address:", err);
    res.status(500).json({ message: "Server error setting default address" });
  }
};
