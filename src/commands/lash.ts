import { ApplicationCommandOptionType, Client, CommandInteraction, EmbedBuilder, UserResolvable } from "discord.js";
import { USERSTATS } from "../main";

module.exports = {
    name: "lash",
    description: "Lash a user for not working enough",
    options: [
        {
            name: "target",
            description: "user to punish",
            type: ApplicationCommandOptionType.Mentionable,
            required: true
        }
    ],
    run: async(client: Client, interaction: CommandInteraction) => {
        const targetId = interaction.options.get("target")?.value as UserResolvable
        const target = await interaction.guild?.members.fetch(targetId)
        if(!target) {
            interaction.followUp("error while executing command")
            return
        }

        var element = await USERSTATS.findOne({ where: { name: target.id } })
        if(!element) {
            element = await USERSTATS.create({
                name: target.id,
                credits: 0,
                lashes: 1,
                lateRecord: 0
            })
        } else {
            element.increment("lashes")
        }
        element = await USERSTATS.findOne({ where: { name: target.id } })

        await interaction.followUp({ 
            embeds: [new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle("🗣️ LAZY WORKER DETECTED 🗣️")
                .setDescription(`${target.user} should get back to work!!! +1 lash!!!`)
                .addFields(
                    { name: "Lashes", value: (element?.get("lashes") as number).toString() }
                )
                .setImage("https://media1.tenor.com/m/55BnB0XphE0AAAAd/richard-attenborough-whip.gif")
                .setTimestamp()]
            })
    }
}
