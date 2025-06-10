require("dotenv").config();
const { io } = require("socket.io-client");
const supabase = require("./supabase");
const sendChat = require("./telegram");

let currentStreak = 0; // Global or file-level variable
let highestStreak = 0; // Optional, to track max ever in-memory

const updateStreak = async (multiplier) => {
  if (multiplier < 2) {
    currentStreak++;
    console.log("🔥 Under 2x streak:", currentStreak);

    // Send a message if streak reaches a certain threshold
    if (currentStreak >= 5) {
      await sendChat(`🚨 ${currentStreak} under 2x streak detected!`);
    }

    // Update highest streak ever (if you're not using DB for this)
    if (currentStreak > highestStreak) {
      highestStreak = currentStreak;
    }
  } else {
    if (currentStreak >= 10) {
      const { error } = await supabase
        .from("high_streaks")
        .insert([{ streak: currentStreak }]);
      if (error) {
        console.error("❌ Failed to save high streak:", error);
      } else {
        console.log("📌 Saved high streak of", currentStreak);
      }
    }
    currentStreak = 0; // Reset streak when multiplier ≥ 2
  }
};

const socket = io("wss://wspublic-psychic.msport.com", {
  path: "/psychic-demo/socket.io",
  transports: ["websocket"],
  query: {
    uid: "1749036560428muid90233870",
    platform: "wap",
    operId: 2,
    clientid: "wap",
    deviceId: "0b676933-edd5-4126-a305-66cfc9839f12",
    EIO: 4,
  },
  extraHeaders: {
    Origin: "https://www.msport.com",
    "User-Agent":
      "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Mobile Safari/537.36",
  },
});

socket.on("connect", () => {
  console.log("✅ Connected");
  socket.emit("bg-join-room");
  socket.emit("bg-round-history", "100");
});

socket.on("bg_r_e", async (data) => {
  console.dir(data, { depth: null });
  const multiplier = parseFloat(data?.m);

  if (!multiplier) return;

  console.log("🎯 Multiplier:", multiplier);

  await updateStreak(multiplier); // Call the streak logic

  const { error } = await supabase
    .from("round_results")
    .insert([{ multiplier }]);

  if (error) {
    console.error("❌ Failed to save multiplier:", error);
  } else {
    console.log("✅ Multiplier saved:", multiplier);
  }
});
