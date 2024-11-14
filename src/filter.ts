import { Client, Message, TextChannel } from "discord.js";
import { filter } from "../config.json"
import { getSocialCreditsEmbed, grantSocialCredits } from "./creditshelper";
import { filterChannel } from "../config.json"

export function handleFilter(client: Client, message: Message) {
    const msg = message.content.toLowerCase()
    filter.forEach(async f => {
        if(msg.includes(f.phrase)) {
            await grantSocialCredits(message.author, f.amount)

            if(filterChannel.active) {
                const channel = await client.channels.fetch(filterChannel.channel) as TextChannel
                channel.send({ embeds: [await getSocialCreditsEmbed(message.author, f.amount, `${f.phrase} mentioned!!!`)] })
            } else {
                message.reply({ embeds: [await getSocialCreditsEmbed(message.author, f.amount, `${f.phrase} mentioned!!!`)] })
            }
        }
    })
}
