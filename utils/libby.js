import { bot, meals, ongoingOrders } from '../index.js';
import { Order } from '../mongoDb.js';

export const sendMealCategories = async (chatId) => {
    const opts = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "Breakfast", callback_data: "Breakfast" },
            { text: "Lunch", callback_data: "Lunch" },
            { text: "Dinner", callback_data: "Dinner" },
          ],
        ],
      },
    };
    await bot.sendMessage(chatId, "Choose a meal category:", opts);
  }

 export const askForQuantity = async (chatId, mealName) => {
    bot.sendMessage(chatId, `How many ${mealName}(s) would you like to order? Please enter a number.`);
    return new Promise((resolve) => {
      bot.once('message', async (quantityMsg) => {
        const quantity = parseInt(quantityMsg.text);
        if (isNaN(quantity) || quantity <= 0) {
          bot.sendMessage(chatId, "Invalid quantity. Please try again.");
          resolve(await askForQuantity(chatId, mealName));
        } else {
          resolve(quantity);
        }
      });
    });
  }
  
  export const askForMoreOrders = async (chatId) => {
    const opts = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "Order more", callback_data: "order_more" },
            { text: "Finish order", callback_data: "finish_order" }
          ]
        ]
      }
    };
    await bot.sendMessage(chatId, "Would you like to order anything else?", opts);
  }
  
  export const finishOrder = async (chatId) => {
    if (!ongoingOrders[chatId] || ongoingOrders[chatId].length === 0) {
      await bot.sendMessage(chatId, "You haven't ordered anything yet.");
      return;
    }
  
    let receipt = "Your order receipt:\n\n";
    let totalOrderPrice = 0;
  
    for (const item of ongoingOrders[chatId]) {
      receipt += `${item.quantity}x ${item.mealName} (${item.mealType})\n`;
      receipt += `   Price: $${item.price.toFixed(2)} each\n`;
      receipt += `   Subtotal: $${item.totalPrice.toFixed(2)}\n\n`;
      totalOrderPrice += item.totalPrice;
    }
  
    receipt += `Total Order Price: $${totalOrderPrice.toFixed(2)}`;
  
    await bot.sendMessage(chatId, receipt);
  
    try {
      const order = new Order({
        userId: chatId,
        items: ongoingOrders[chatId],
        totalPrice: totalOrderPrice
      });
      await order.save();
      await bot.sendMessage(chatId, "Your order has been placed successfully!");
    } catch (error) {
      console.error('Failed to save order:', error);
      await bot.sendMessage(chatId, `Failed to place order: ${error.message}. Please try again.`);
    }
  
    delete ongoingOrders[chatId];
  }
  