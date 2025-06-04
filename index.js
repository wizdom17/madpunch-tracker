require("dotenv").config();
const { io } = require("socket.io-client");
const supabase = require("./supabase");

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

  const { error } = await supabase
    .from("round_results")
    .insert([{ multiplier }]);

  if (error) {
    console.error("❌ Failed to save multiplier:", error);
  } else {
    console.log("✅ Multiplier saved:", multiplier);
  }
});
