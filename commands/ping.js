const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check bot latency"),

  async execute(interaction, client, log) {
    const msg = await interaction.reply({ content: "Pinging...", fetchReply: true });

    const ping = msg.createdTimestamp - interaction.createdTimestamp;

    interaction.editReply(`🏓 Pong! ${ping}ms`);
    log(`📡 Ping used by ${interaction.user.tag}`);
  }
};