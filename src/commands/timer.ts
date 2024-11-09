import { ApplicationCommandOptionType, Client, CommandInteraction, EmbedBuilder, GuildBasedChannel, GuildMember, Message, PermissionFlagsBits, Snowflake, UserResolvable } from "discord.js";
import { getTimeString } from "../utils"
import { TIMERINFO } from "../main"

module.exports = {
    name: "timer",
    description: "start a timer for being too late",
    defaultMemberPermissions: PermissionFlagsBits.ModerateMembers,
    dmPermission: false,
    options: [
        {
            name: "target",
            description: "the one to punish for being late",
            type: ApplicationCommandOptionType.Mentionable,
            required: true
        },
        {
            name: "channel",
            description: "the channel to start the timer for",
            type: ApplicationCommandOptionType.Channel,
            required: true
        }
    ],
    run: async(client: Client, interaction: CommandInteraction) => {
        const targetId = interaction.options.get("target")?.value as UserResolvable
        TIMERINFO.target = await interaction.guild?.members.fetch(targetId) as GuildMember
        if(!TIMERINFO.target) {
            interaction.followUp("error while executing command")
            return
        }

        const channelId = interaction.options.get("channel")?.value as Snowflake
        TIMERINFO.channel = await interaction.guild?.channels.fetch(channelId) as GuildBasedChannel
        if(!TIMERINFO.channel) {
            interaction.followUp("error while executing command")
            return
        }

        TIMERINFO.active = true

        TIMERINFO.startTime = new Date()

        TIMERINFO.msg = await interaction.followUp({ embeds: [new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle("⏲️ YOU ARE LATE ⏲️")
            .setDescription(`${TIMERINFO.target.user} is late. This will result in a loss of social credits!`)
            .addFields(
                { name: "Time", value: "00:00:00" }
            )
            .setTimestamp()
        ]})

        TIMERINFO.interval = setInterval(() => {
            if(!TIMERINFO.startTime) {
                return
            }

            if(!TIMERINFO.msg) {
                return
            }

            TIMERINFO.time = new Date(new Date().getTime() - TIMERINFO.startTime.getTime())

            const embed = TIMERINFO.msg.embeds[0]
            embed.fields[0].value = getTimeString(TIMERINFO.time)

            TIMERINFO.msg.edit({ embeds: [embed] })
        }, 1000)
    }
}
