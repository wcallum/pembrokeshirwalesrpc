require("dotenv").config();
const fs = require("fs");
const {
  Client,
  GatewayIntentBits,
  Collection,
  Events
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

client.commands = new Collection();

/* ---------------- COMMAND LOADING ---------------- */
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);

  if (command?.data?.name) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(`❌ Invalid command file: ${file}`);
  }
}

/* ---------------- SAFE LOGGER ---------------- */
function log(message) {
  const channelId = process.env.LOG_CHANNEL_ID;

  if (!channelId) return;

  const channel = client.channels.cache.get(channelId);

  if (!channel) return;

  channel.send({
    content: `📡 **LOG:** ${message}`
  }).catch(() => {});
}

/* ---------------- READY EVENT ---------------- */
client.once(Events.ClientReady, () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  log(`Bot is online as **${client.user.tag}**`);
});

/* ---------------- SLASH COMMAND HANDLER ---------------- */
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    return interaction.reply({
      content: "❌ Command not found.",
      ephemeral: true
    });
  }

  try {
    await command.execute(interaction, client, log);
  } catch (err) {
    console.error(`Command error:`, err);

    if (!interaction.replied) {
      interaction.reply({
        content: "❌ Something went wrong while executing this command.",
        ephemeral: true
      });
    }
  }
});

/* ---------------- GLOBAL BLACKLIST SYSTEM ---------------- */
client.on(Events.GuildMemberAdd, async member => {
  try {
    const blacklistPath = "./data/blacklist.json";

    if (!fs.existsSync(blacklistPath)) return;

    const blacklist = JSON.parse(fs.readFileSync(blacklistPath, "utf8"));

    if (blacklist.includes(member.id)) {
      await member.ban({
        reason: "Global blacklist enforcement"
      });

      log(`⛔ Auto-banned **${member.user.tag}** (blacklisted)`);
    }
  } catch (err) {
    console.error("Blacklist error:", err);
  }
});

/* ---------------- LOGIN ---------------- */
client.login(process.env.TOKEN);