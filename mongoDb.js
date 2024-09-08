import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  } 
};

const orderSchema = new mongoose.Schema({
  userId: String,
  items: [{
    mealName: String,
    mealType: String,
    price: Number,
    quantity: Number,
    totalPrice: Number
  }],
  totalPrice: Number,
  orderedAt: { type: Date, default: Date.now }
});

export const Order = mongoose.model('Order', orderSchema);

export default connectDB;