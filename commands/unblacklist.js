const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unblacklist")
    .setDescription("Remove user from blacklist")
    .addUserOption(opt =>
      opt.setName("user").setDescription("User").setRequired(true)
    ),

  async execute(interaction, client, log) {
    if (interaction.user.id !== process.env.OWNER_ID)
      return interaction.reply({ content: "No permission.", ephemeral: true });

    const user = interaction.options.getUser("user");

    let blacklist = JSON.parse(fs.readFileSync("./data/blacklist.json"));
    blacklist = blacklist.filter(id => id !== user.id);

    fs.writeFileSync("./data/blacklist.json", JSON.stringify(blacklist, null, 2));

    interaction.reply(`✅ Removed ${user.tag}`);
    log(`✅ Unblacklisted ${user.tag}`);
if (!interaction.member.permissions.has("Administrator")) {
  return interaction.reply({ content: "❌ Admin only", ephemeral: true });
} 
}
};