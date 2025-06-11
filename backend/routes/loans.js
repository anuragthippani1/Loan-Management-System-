const express = require("express");
const router = express.Router();
const Loan = require("../models/Loan");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

// Get all loans (admin only)
router.get("/", [auth, admin], async (req, res) => {
  try {
    const loans = await Loan.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get user's loans
router.get("/my-loans", auth, async (req, res) => {
  try {
    const loans = await Loan.find({ user: req.user.userId }).sort({
      createdAt: -1,
    });
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Create new loan
router.post("/", auth, async (req, res) => {
  try {
    const { loanType, amount, interestRate, term, startDate } = req.body;

    const loan = new Loan({
      user: req.user.userId,
      loanType,
      amount,
      interestRate,
      term,
      startDate,
      emiAmount: 0, // Will be calculated
      totalAmount: 0, // Will be calculated
      remainingAmount: amount,
    });

    // Calculate EMI and total amount
    loan.emiAmount = loan.calculateEMI();
    loan.totalAmount = loan.calculateTotalAmount();

    await loan.save();
    res.status(201).json(loan);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get loan by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    // Check if user is authorized to view this loan
    if (
      loan.user._id.toString() !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(loan);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update loan status (admin only)
router.patch("/:id/status", [auth, admin], async (req, res) => {
  try {
    const { status } = req.body;
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    loan.status = status;
    await loan.save();
    res.json(loan);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Record loan payment
router.post("/:id/payment", auth, async (req, res) => {
  try {
    const { amount } = req.body;
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    // Check if user is authorized
    if (loan.user.toString() !== req.user.userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Add payment to history
    loan.paymentHistory.push({
      amount,
      date: new Date(),
      status: "completed",
    });

    // Update remaining amount
    loan.remainingAmount -= amount;

    // Update next payment date (30 days from last payment)
    loan.nextPaymentDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Check if loan is completed
    if (loan.remainingAmount <= 0) {
      loan.status = "completed";
    }

    await loan.save();
    res.json(loan);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
