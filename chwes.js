// Discord and Modules
const { PermissionsBitField, EmbedBuilder, ButtonStyle, Client, GatewayIntentBits, ChannelType, Partials, ActionRowBuilder, SelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType, SelectMenuInteraction, ButtonBuilder, AuditLogEvent } = require("discord.js");

// İNTENTS
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildEmojisAndStickers, GatewayIntentBits.GuildIntegrations, GatewayIntentBits.GuildWebhooks, GatewayIntentBits.GuildInvites, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.DirectMessages, GatewayIntentBits.DirectMessageReactions, GatewayIntentBits.DirectMessageTyping, GatewayIntentBits.MessageContent], shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember, Partials.Reaction, Partials.GuildScheduledEvent, Partials.User, Partials.ThreadMember] });
// Database
const db = require("croxydb")

global.client = client;
client.commands = (global.commands = []);
const { readdirSync } = require("fs")
const { TOKEN } = require("./config.json");
readdirSync('./commands').forEach(f => {
    if (!f.endsWith(".js")) return;

    const props = require(`./commands/${f}`);

    client.commands.push({
        name: props.name.toLowerCase(),
        description: props.description,
        options: props.options,
        dm_permission: false,
        type: 1
    });

    console.log(`[COMMAND] ${props.name} komutu yüklendi.`)

});
readdirSync('./events').forEach(e => {

    const eve = require(`./events/${e}`);
    const name = e.split(".")[0];

    client.on(name, (...args) => {
        eve(client, ...args)
    });
    console.log(`[EVENT] ${name} eventi yüklendi.`)
});

const InvitesTracker = require('@androz2091/discord-invites-tracker');
const tracker = InvitesTracker.init(client, {
    fetchGuilds: true,
    fetchVanity: true,
    fetchAuditLogs: true
});

client.login(TOKEN)

// Bir Hata Oluştu
process.on("unhandledRejection", (reason, p) => {
    console.log(reason, p);
})

process.on("unhandledRejection", async (error) => {
    return console.log("Bir hata oluştu! " + error)
})


tracker.on('guildMemberAdd', (member, type, invite) => {

    const data = db.get(`davetLog_${member.guild.id}`)
    if (!data) return;
    const inviteChannel = member.guild.channels.cache.get(data.channel);
    if (!inviteChannel) return db.delete(`davetLog_${member.guild.id}`); // ayarlanan kanal yoksa sistemi sıfırlar

    const invitedMember = db.get(`invitedİnfo_${member.id}_${member.guild.id}`)
    if (invitedMember) {
        if (data.message === "embed") {

            const invite_embed = new EmbedBuilder()
                .setColor("DarkButNotBlack")
                .setAuthor({ name: `${member.user.username} giriş yaptı` }).setDescription(`Hoşgeldin ${member}! Daha önce <@${invitedMember.inviterİd}> tarafından davet edilmişsin! Davet Linki: ${invite.url}`)
                .setThumbnail(invitedMember.inviterAvatarURL)
                .addField("Davet Bilgileri", `Davet Eden: <@${invitedMember.inviterİd}> (${invitedMember.inviterUsername}#${invitedMember.inviterDiscriminator})\nDavet Sayısı: ${invitedMember.totalInvites}`)
                .addField("Katıldıktan Sonra", `Katıldığı Tarih: ${new Date().toLocaleString("tr-TR")}`)
                .setFooter(member.guild.name, member.guild.iconURL())
                .setTimestamp();
                
                inviteChannel.send({ embeds: [invite_embed] });
                }
                else if (data.message === "text") {
                const invite_text = `Hoşgeldin ${member}! Daha önce <@${invitedMember.inviterİd}> tarafından davet edilmişsin!\nDavet Linki: ${invite.url}\n\nDavet Bilgileri:\nDavet Eden: <@${invitedMember.inviterİd}> (${invitedMember.inviterUsername}#${invitedMember.inviterDiscriminator})\nDavet Sayısı: ${invitedMember.totalInvites}\n\nKatıldığı Tarih: ${new Date().toLocaleString("tr-TR")}\n\n${member.guild.name}`;
                inviteChannel.send(invite_text);
                }
                }
                });