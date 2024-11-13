import { ApplicationCommandOptionType, ChannelType, Client, CommandInteraction, EmbedBuilder, GuildBasedChannel, GuildMember, Message, PermissionFlagsBits, Snowflake, UserResolvable } from "discord.js";
import { getTimeString } from "../utils"
import { TIMERINFO } from "../main"
import { Command } from "../commandregistry";

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
            channelTypes: [ChannelType.GuildVoice],
            required: true
        }
    ],
    run: async(client: Client, interaction: CommandInteraction) => {
        if(TIMERINFO.active) {
            await interaction.followUp("The timer is already running")
            return
        }

        const targetId = interaction.options.get("target")?.value as UserResolvable
        TIMERINFO.target = await interaction.guild?.members.fetch(targetId) as GuildMember
        if(!TIMERINFO.target) {
            await interaction.followUp("error while executing command")
            return
        }

        const channelId = interaction.options.get("channel")?.value as Snowflake
        TIMERINFO.channel = await interaction.guild?.channels.fetch(channelId) as GuildBasedChannel
        if(!TIMERINFO.channel) {
            await interaction.followUp("error while executing command")
            return
        }

        if(TIMERINFO.channel.type != ChannelType.GuildVoice) {
            await interaction.followUp("channel has to be a voice channel")
            return
        }

        TIMERINFO.active = true

        TIMERINFO.startTime = new Date()

        TIMERINFO.msg = await interaction.followUp({ embeds: [new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle("⏲️ YOU ARE LATE ⏲️")
            .setDescription(`${TIMERINFO.target.user} is late. Quickly join ${TIMERINFO.channel}!!!`)
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
} as Command
