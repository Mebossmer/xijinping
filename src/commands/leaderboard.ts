import { APIEmbedField, ApplicationCommandOptionType, Client, CommandInteraction, EmbedBuilder, UserResolvable } from "discord.js";
import { USERSTATS } from "../main";
import { Command } from "../commandregistry";
import { getTimeString } from "../utils";

module.exports = {
    name: "leaderboard",
    description: "display the users most loyal to our supreme leader",
    dmPermission: false,
    options: [
        {
            name: "option",
            description: "the value to rank members for",
            type: ApplicationCommandOptionType.Number,
            required: true,
            choices: [
                {
                    name: "Social Credits",
                    value: 1
                },
                {
                    name: "Lashes",
                    value: 2
                },
                {
                    name: "Being Late",
                    value: 3
                }
            ]
        }
    ],
    run: async(client: Client, interaction: CommandInteraction) => {
        const option: number = interaction.options.get("option")?.value as number

        var valueName: string | undefined = undefined
        switch(option) {
            case 1:
                valueName = "credits"
                break

            case 2:
                valueName = "lashes"
                break

            case 3:
                valueName = "lateRecord"
                break

            default:
                await interaction.followUp("wrong choice (how???)")
                return
        }


        const elementList = await USERSTATS.findAll()
        elementList.sort((a, b) => {
            const val1 = a.get(valueName as string) as number
            const val2 = b.get(valueName as string) as number

            if(val1 < val2) {
                return 1
            } else if(val1 > val2) {
                return -1
            }

            return 0
        })

        const fields: APIEmbedField[] = []
        for(var i = 0; i < elementList.length; i++) {
            const member = await interaction.guild?.members.fetch(elementList[i].get("name") as UserResolvable)
            const value = elementList[i].get(valueName as string) as number
            var displayString = value.toString()
            if(option == 3) {
                displayString = getTimeString(new Date(value))
            }
            fields.push({ name: member?.user.username, value: displayString } as APIEmbedField)

            if(i >= 5) {
                break
            }
        }

        var leaderboardString = ""
        switch(option) {
            case 1:
                leaderboardString = "Our most loyal members ✅"
                break

            case 2:
                leaderboardString = "Our laziest workers 👎"
                break

            case 3:
                leaderboardString = "Records for being late ⏰"
                break
        }

        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle("🇨🇳 LEADERBOARD 🇨🇳")
            .setDescription(leaderboardString)
            .addFields(fields)
            .setTimestamp()

        await interaction.followUp({ embeds: [embed] })
    }
} as Command
