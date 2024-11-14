import { token, clientId, guildId } from "../config.json"
import { ChatInputApplicationCommandData, Client, CommandInteraction, REST, Routes, } from "discord.js";
import path from "node:path";
import fs from "node:fs"


export interface Command extends ChatInputApplicationCommandData {
    run: (client: Client, interaction: CommandInteraction) => void
}

const commands: Command[] = []

export async function deployCommands(client: Client) {
    if(!client.user || !client.application) {
        return
    }

    const commandPath = path.join(__dirname, "commands")
    const commandFolder = fs.readdirSync(commandPath)
    for(const file of commandFolder) {
        const filePath = path.join(commandPath, file)

        commands.push(require(filePath))
    }

    const rest = new REST().setToken(token)

    const data = await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands }
    )

    console.log(`deployed ${commands.length} application commands`)
}

export async function handleCommand(client: Client, interaction: CommandInteraction) {
    const command = commands.find(c => c.name == interaction.commandName)
    if(!command) {
        interaction.reply("An error occured")
        return
    }

    await interaction.deferReply()

    command.run(client, interaction)
}
