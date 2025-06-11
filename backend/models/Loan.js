const mongoose = require("mongoose");

const loanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    loanType: {
      type: String,
      required: true,
      enum: ["personal", "home", "business", "education", "vehicle"],
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    interestRate: {
      type: Number,
      required: true,
      min: 0,
    },
    term: {
      type: Number,
      required: true,
      min: 1,
    },
    startDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "active",
        "completed",
        "defaulted",
      ],
      default: "pending",
    },
    emiAmount: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    remainingAmount: {
      type: Number,
      required: true,
    },
    nextPaymentDate: {
      type: Date,
    },
    paymentHistory: [
      {
        amount: Number,
        date: Date,
        status: {
          type: String,
          enum: ["pending", "completed", "failed"],
          default: "pending",
        },
      },
    ],
    documents: [
      {
        type: String,
        name: String,
        url: String,
        uploadedAt: Date,
      },
    ],
    notes: [
      {
        content: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
        createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Calculate EMI amount
loanSchema.methods.calculateEMI = function () {
  const principal = this.amount;
  const rate = this.interestRate / 100 / 12; // Monthly interest rate
  const time = this.term * 12; // Total number of months

  const emi =
    (principal * rate * Math.pow(1 + rate, time)) /
    (Math.pow(1 + rate, time) - 1);
  return Math.round(emi * 100) / 100;
};

// Calculate total amount to be repaid
loanSchema.methods.calculateTotalAmount = function () {
  return this.emiAmount * this.term * 12;
};

const Loan = mongoose.model("Loan", loanSchema);

module.exports = Loan;
