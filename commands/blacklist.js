const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");

const COLOR = 0x89CFF0;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("blacklist")
    .setDescription("Blacklist a user globally")
    .addUserOption(opt =>
      opt.setName("user").setDescription("User").setRequired(true)
    ),

  async execute(interaction, client, log) {

    if (!interaction.member.permissions.has("Administrator")) {
      return interaction.reply({
        content: "❌ You need **Administrator** permission.",
        ephemeral: true
      });
    }

    const user = interaction.options.getUser("user");

    let blacklist = JSON.parse(require("fs").readFileSync("./data/blacklist.json"));

    if (!blacklist.includes(user.id)) {
      blacklist.push(user.id);
      require("fs").writeFileSync("./data/blacklist.json", JSON.stringify(blacklist, null, 2));
    }

    // global ban
    client.guilds.cache.forEach(async guild => {
      try {
        const member = await guild.members.fetch(user.id).catch(() => null);
        if (member) await member.ban({ reason: "Global blacklist" });
      } catch {}
    });

    const embed = new EmbedBuilder()
      .setTitle("⛔ User Blacklisted")
      .setColor(COLOR)
      .setDescription(`${user.tag} has been globally blacklisted`)
      .setFooter({ text: interaction.guild.name });

    await interaction.reply({ embeds: [embed] });

    log("Blacklist Action", `${interaction.user.tag} blacklisted ${user.tag}`);
  }
};