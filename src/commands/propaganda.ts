import { createAudioPlayer, createAudioResource, DiscordGatewayAdapterCreator, entersState, getVoiceConnection, joinVoiceChannel, NoSubscriberBehavior, VoiceConnectionStatus } from "@discordjs/voice";
import { ApplicationCommandOptionType, Client, CommandInteraction, User } from "discord.js";
import { createReadStream } from "node:fs";
import { join } from "node:path";
import { getSocialCreditsEmbed, getSocialCreditsEmbedForUsers, grantSocialCreditstoUsers } from "../creditshelper";

var voiceEnter: number
var voiceLeave: number

module.exports = {
    name: "propaganda",
    description: "farm social credits by spreading chinese culture!",
    options: [
        {
            name: "operation",
            description: "wether to start or stop",
            type: ApplicationCommandOptionType.Number,
            required: true,
            choices: [
                {
                    name: "start",
                    value: 0
                },
                {
                    name: "stop",
                    value: 1
                }
            ]
        }
    ],
    run: async(client: Client, interaction: CommandInteraction) => {
        const op = interaction.options.get("operation")?.value

        if(!interaction.channel?.isVoiceBased()) {
            await interaction.followUp("This command has to be executed in a voice channel")
            return
        }

        if(!interaction.guild) {
            await interaction.followUp("???")
            return
        }

        if(op == 0) {
            // start culture

            const connection = joinVoiceChannel({
                channelId: interaction.channel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.channel.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator,
                selfDeaf: false
            })

            const player = createAudioPlayer({
                behaviors: {
                    noSubscriber: NoSubscriberBehavior.Pause
                }
            })

            player.on("error", error => {
                interaction.followUp("Failed to start propaganda")
                player.stop()
                connection.destroy()

                throw error
            })

            connection.on(VoiceConnectionStatus.Ready, async(oldState, newState) => {
                voiceEnter = new Date().getTime()

                const resource = createAudioResource(createReadStream(join(__dirname, "../../resources/red_sun_in_the_sky.webm")))
                player.play(resource)

                connection.subscribe(player)
            })

            connection.on(VoiceConnectionStatus.Disconnected, async(oldState, newState) => {
                try {
                    await Promise.race([
                        entersState(connection, VoiceConnectionStatus.Signalling, 5000),
                        entersState(connection, VoiceConnectionStatus.Connecting, 5000)
                    ])
                } catch(err) {
                    player.stop()
                    connection.destroy()
                }
            })

            const users: User[] = []
            for(const u of interaction.channel.members.values()) {
                users.push(u.user)
            }

            await grantSocialCreditstoUsers(users, 1000)

            await interaction.followUp({ embeds: [await getSocialCreditsEmbedForUsers(users, 1000, "Started listening to chinese ~~propaganda~~ culture")] })
        } else {
            // stop culture

            voiceLeave = new Date().getTime()

            const diff = (voiceLeave - voiceEnter) / 1000

            const connection = getVoiceConnection(interaction.guild.id)
            connection?.disconnect()

            const credits = Math.round(diff * 100)

            const users: User[] = []
            for(const u of interaction.channel.members.values()) {
                users.push(u.user)
            }

            await grantSocialCreditstoUsers(users, credits)

            await interaction.followUp({ embeds: [await getSocialCreditsEmbed(interaction.user, credits, `Listened to chinese ~~propaganda~~ culture for ${diff} seconds`)] })
        }
    }
}
