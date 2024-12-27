import { Client, CommandInteraction, PermissionFlagsBits } from "discord.js";
import { Command } from "../commandregistry";
import { LOGGER, TIMERINFO } from "../main";

module.exports = {
    name: "stoptimer",
    description: "stop any running timer",
    defaultMemberPermissions: PermissionFlagsBits.ModerateMembers,
    dmPermission: false,
    run: async(client: Client, interaction: CommandInteraction) => {
        TIMERINFO.active = false

        if(!TIMERINFO.interval) {
            await interaction.followUp("No timer to stop")
            return
        }

        clearInterval(TIMERINFO.interval)

        await interaction.followUp("Successfully cancelled timer")

        LOGGER.info(`Stopped timer for user ${TIMERINFO.target?.user}`)
    }
} as Command
