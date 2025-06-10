require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const supabase = require("./supabase");

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(botToken, { polling: false });

const sendChat = async (message) => {
  const { data, error } = await supabase
    .from("user_chat_id")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Supabase query error:", error.message);
    return;
  }

  for (const chats of data) {
    try {
      await bot.sendMessage(chats.chatId, message);
      console.log("📤 Sent to:", chats.chatId);
    } catch (err) {
      console.error("❌ Failed to send to", chats.chatId, err.message);
    }
  }
};

module.exports = sendChat;
