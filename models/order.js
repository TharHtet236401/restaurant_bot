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
  
  export default Order;