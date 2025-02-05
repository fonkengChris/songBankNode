const mongoose = require("mongoose");
const Joi = require("joi");

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: [
        "PENDING",
        "COMPLETED",
        "SAVED",
        "APPROVED",
        "VOIDED",
        "PAYER_ACTION_REQUIRED",
      ],
    },
    paymentDetails: {
      mediaFileId: String,
      purchaseType: {
        type: String,
        enum: ["SONG", "SUBSCRIPTION"],
        default: "SONG",
      },
      provider: {
        type: String,
        enum: ["PAYPAL", "MTN_MOMO"],
        required: true,
      },
      originalAmount: Number,
      originalCurrency: String,
      convertedAmount: Number,
      convertedCurrency: String,
      exchangeRate: Number,
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.methods.toResponse = function () {
  return {
    orderId: this.orderId,
    status: this.status,
    amount: this.amount,
    description: this.description,
    createdAt: this.createdAt,
    mediaFileId: this.paymentDetails?.mediaFileId,
    purchaseType: this.paymentDetails?.purchaseType,
  };
};

const Payment = mongoose.model("Payment", paymentSchema);

function validatePayment(payment) {
  const schema = Joi.object({
    orderId: Joi.string().required(),
    amount: Joi.number().required().min(0),
    description: Joi.string().required(),
    status: Joi.string().required(),
    paymentDetails: Joi.object({
      mediaFileId: Joi.string(),
      purchaseType: Joi.string().valid("SONG", "SUBSCRIPTION"),
    }),
  });

  return schema.validate(payment);
}

exports.Payment = Payment;
exports.validate = validatePayment;
