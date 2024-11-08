import { APIEmbedField, Client, CommandInteraction, EmbedBuilder, UserResolvable } from "discord.js";
import { USERSTATS } from "../main";

module.exports = {
    name: "leaderboard",
    description: "display the users most loyal to our supreme leader",
    run: async(client: Client, interaction: CommandInteraction) => {
        const elementList = await USERSTATS.findAll()
        elementList.sort((a, b) => {
            const val1 = a.get("credits") as number
            const val2 = b.get("credits") as number

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
            fields.push({ name: member?.user.username, value: (elementList[i].get("credits") as number).toString() } as APIEmbedField)

            if(i >= 5) {
                break
            }
        }

        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle("Leaderboard")
            .setDescription("Our most loyal members")
            .addFields(fields)
            .setTimestamp()

        await interaction.followUp({ embeds: [embed] })
    }
}
