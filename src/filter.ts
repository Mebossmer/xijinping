import { Message } from "discord.js";
import { filter } from "../config.json"
import { getSocialCreditsEmbed, grantSocialCredits } from "./creditshelper";


export function handleFilter(message: Message) {
    const msg = message.content.toLowerCase()
    filter.forEach(async f => {
        if(msg.includes(f.phrase)) {
            await grantSocialCredits(message.author, f.amount)
            message.reply({ embeds: [await getSocialCreditsEmbed(message.author, f.amount, `${f.phrase} mentioned!!!`)] })
        }
    })
}
