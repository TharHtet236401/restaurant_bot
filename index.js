import TelegramBot from "node-telegram-bot-api";
import { configDotenv } from "dotenv";
import meals from './meals.js';
import connectDB from './mongoDb.js';
import { Order } from './mongoDb.js';
import { sendMealCategories, askForQuantity, askForMoreOrders, finishOrder } from './utils/libby.js';

configDotenv();

connectDB();

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

// Set up the menu commands
const commands = [
  { command: 'start', description: 'Start the bot' },
  { command: 'help', description: 'Get help information' },
  { command: 'options', description: 'View available meal options' },
  { command: 'myorders', description: 'View your order history' }
];

// Set the menu commands
bot.setMyCommands(commands).then(() => {
}).catch((error) => {
  console.error('Failed to set menu commands:', error);
});

// Set the chat menu button
bot.setMyDefaultAdministratorRights({ is_anonymous: false }).then(() => {
  return bot.setChatMenuButton({
    menu_button: {
      type: 'commands'
    }
  });
}).then(() => {
  //console.log('Chat menu button has been set');
}).catch((error) => {
  console.error('Failed to set chat menu button:', error);
});

// Read meals from file

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const welcomeMessage = `Welcome to the bot!

Here are some instructions:
/help - Get help information
/options - View available meal options
/myorders - View your order history

Feel free to explore these commands!`;

  bot.sendMessage(chatId, welcomeMessage);
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Use /options to view meal categories and make an order. Use /myorders to view your order history.");
});


bot.onText(/\/options/, (msg) => {
  const chatId = msg.chat.id;
  const opts = {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Start Order", callback_data: "start_order" }],
      ],
    },
  };
  bot.sendMessage(chatId, "Ready to place an order?", opts);
});

// Listen for button press
bot.on("callback_query", async (callbackQuery) => {
  const msg = callbackQuery.message;
  const chatId = msg.chat.id;
  const data = callbackQuery.data;

  // Removed console.log statement

  if (data === "start_order" || data === "order_more") {
    await sendMealCategories(chatId);
  } else if (meals[data]) {
    for (const meal of meals[data]) {
      const caption = `${meal.type}: ${meal.name} - $${meal.price}`;
      const opts = {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Order this meal", callback_data: `order_${data}_${meal.name}` }]
          ]
        }
      };
      try {
        await bot.sendPhoto(msg.chat.id, meal.image, { caption: caption, ...opts });
      } catch (error) {
        console.error(`Failed to send photo for ${meal.name}:`, error);
        bot.sendMessage(msg.chat.id, `${caption}\n(Image unavailable)`, opts);
      }
    }
  } else if (data.startsWith('order_')) {
    const [_, category, ...mealNameParts] = data.split('_');
    const mealName = mealNameParts.join('_');
    
    if (meals[category]) {
      const meal = meals[category].find(m => m.name === mealName);
      
      if (meal) {
        if (!ongoingOrders[chatId]) {
          ongoingOrders[chatId] = [];
        }

        const quantity = await askForQuantity(chatId, mealName);
        
        ongoingOrders[chatId].push({
          mealName: meal.name,
          mealType: meal.type,
          price: meal.price,
          quantity: quantity,
          totalPrice: meal.price * quantity
        });

        await askForMoreOrders(chatId);
      } else {
        bot.sendMessage(chatId, "Meal not found. Please try again.");
      }
    } else {
      bot.sendMessage(chatId, "Invalid meal category. Please try again.");
    }
  } else if (data === "finish_order") {
    await finishOrder(chatId);
  } else {
    bot.sendMessage(chatId, "Sorry, couldn't process your request. Please try again.");
  }
});


// async function askForQuantity(chatId, mealName) {
//   bot.sendMessage(chatId, `How many ${mealName}(s) would you like to order? Please enter a number.`);
//   return new Promise((resolve) => {
//     bot.once('message', async (quantityMsg) => {
//       const quantity = parseInt(quantityMsg.text);
//       if (isNaN(quantity) || quantity <= 0) {
//         bot.sendMessage(chatId, "Invalid quantity. Please try again.");
//         resolve(await askForQuantity(chatId, mealName));
//       } else {
//         resolve(quantity);
//       }
//     });
//   });
// }

// async function askForMoreOrders(chatId) {
//   const opts = {
//     reply_markup: {
//       inline_keyboard: [
//         [
//           { text: "Order more", callback_data: "order_more" },
//           { text: "Finish order", callback_data: "finish_order" }
//         ]
//       ]
//     }
//   };
//   await bot.sendMessage(chatId, "Would you like to order anything else?", opts);
// }

// async function finishOrder(chatId) {
//   if (!ongoingOrders[chatId] || ongoingOrders[chatId].length === 0) {
//     await bot.sendMessage(chatId, "You haven't ordered anything yet.");
//     return;
//   }

//   let receipt = "Your order receipt:\n\n";
//   let totalOrderPrice = 0;

//   for (const item of ongoingOrders[chatId]) {
//     receipt += `${item.quantity}x ${item.mealName} (${item.mealType})\n`;
//     receipt += `   Price: $${item.price.toFixed(2)} each\n`;
//     receipt += `   Subtotal: $${item.totalPrice.toFixed(2)}\n\n`;
//     totalOrderPrice += item.totalPrice;
//   }

//   receipt += `Total Order Price: $${totalOrderPrice.toFixed(2)}`;

//   await bot.sendMessage(chatId, receipt);

//   try {
//     const order = new Order({
//       userId: chatId,
//       items: ongoingOrders[chatId],
//       totalPrice: totalOrderPrice
//     });
//     await order.save();
//     await bot.sendMessage(chatId, "Your order has been placed successfully!");
//   } catch (error) {
//     console.error('Failed to save order:', error);
//     await bot.sendMessage(chatId, `Failed to place order: ${error.message}. Please try again.`);
//   }

//   delete ongoingOrders[chatId];
// }

// Add this new object to store ongoing orders
const ongoingOrders = {};

bot.onText(/\/myorders/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const orders = await Order.find({ userId: chatId }).sort({ orderedAt: -1 }).limit(5);
    if (orders.length > 0) {
      let response = "📜 *Your Recent Orders*\n\n";
      orders.forEach((order, index) => {
        response += `*Order #${index + 1}*\n`;
        response += `📅 ${order.orderedAt.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n`;
        response += `🕒 ${order.orderedAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}\n\n`;
        
        response += "```\n"; // Start of monospace block for better alignment
        response += "Item                  Qty   Price    Subtotal\n";
        response += "--------------------------------------------\n";
        
        order.items.forEach(item => {
          const itemName = `${item.mealName}`.padEnd(20);
          const quantity = item.quantity.toString().padStart(3);
          const price = `$${item.price.toFixed(2)}`.padStart(8);
          const subtotal = `$${item.totalPrice.toFixed(2)}`.padStart(9);
          response += `${itemName} ${quantity} ${price} ${subtotal}\n`;
        });
        
        response += "--------------------------------------------\n";
        response += `${"Total:".padEnd(32)}$${order.totalPrice.toFixed(2)}\n`;
        response += "```\n\n"; // End of monospace block
      });
      bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });
    } else {
      bot.sendMessage(chatId, "You haven't placed any orders yet. Use /options to start ordering!");
    }
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    bot.sendMessage(chatId, `Sorry, there was an error fetching your orders: ${error.message}. Please try again later.`);
  }
});

bot.on("sticker", (msg) => {
  bot.sendMessage(msg.chat.id, "Nice sticker!");
});

export { bot, meals, ongoingOrders };