import { ApplicationCommandOptionType, Client, CommandInteraction, PermissionFlagsBits, UserResolvable } from "discord.js";
import { getSocialCreditsEmbed, grantSocialCredits } from "../creditshelper";

module.exports = {
        name: "socialcredits",
        description: "grant social credits to a user",
        defaultMemberPermissions: PermissionFlagsBits.ModerateMembers,
        dmPermission: false,
        options: [
            {
                name: "target",
                description: "user to target",
                type: ApplicationCommandOptionType.Mentionable,
                required: true
            },
            {
                name: "number",
                description: "number of social credits",
                type: ApplicationCommandOptionType.Number,
                required: true
            },
            {
                name: "reason",
                description: "reason for social credits",
                type: ApplicationCommandOptionType.String,
                required: false
            }
        ],
        run: async(client: Client, interaction: CommandInteraction) => {
            const targetId = interaction.options.get("target")?.value as UserResolvable
            const target = await interaction.guild?.members.fetch(targetId)
            if(!target) {
                interaction.followUp("error while executing command")
                return
            }

            const number = interaction.options.get("number")?.value as number
            var string = number.toString()
            if(number > 0) {
                string = "+" + string
            }

            const reason = interaction.options.get("reason")?.value as string || "None"

            await grantSocialCredits(target.user, number)

            await interaction.followUp({ embeds: [await getSocialCreditsEmbed(target.user, number, reason)] })
        }
}