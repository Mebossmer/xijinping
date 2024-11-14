import { EmbedBuilder, TextChannel, User } from "discord.js"
import { USERSTATS } from "./main"

function getGif(credits: number): string {
    if(credits >= 0) {
        return "https://media1.tenor.com/m/6SGaQJ-cLWIAAAAd/social-credit.gif"
    } else {
        return "https://media1.tenor.com/m/F-D5EhlQXdMAAAAC/nalog.gif"
    }
}

export async function getSocialCreditsEmbed(target: User, credits: number, reason: string) {
    var string = credits.toString()
    if(credits > 0) {
        string = "+" + string
    }

    const element = await USERSTATS.findOne({ where: { name: target.id } })

    return new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle("🚨 SOCIAL CREDITS 🚨")
        .setDescription(`${string} social credits for ${target}!`)
        .addFields(
            { name: "Current social credits", value: (element?.get("credits") as number).toString() },
            { name: "Reason", value: reason }
        )
        .setImage(getGif(credits))
        .setTimestamp()
}

export async function grantSocialCredits(target: User, credits: number) {
    var element = await USERSTATS.findOne({ where: { name: target.id } })
    if(!element) {
        element = await USERSTATS.create({
            name: target.id,
            credits: credits,
            lashes: 0,
            lateRecord: 0
        })
    } else {
        element.increment("credits", { by: credits })
    }
}

export async function getSocialCreditsEmbedForUsers(targets: User[], credits: number, reason: string) {
    var string = credits.toString()
    if(credits > 0) {
        string = "+" + string
    }

    var usrstr = ""
    for(const user of targets) {
        usrstr += `<@${user.id}> `
    }

    return new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle("🚨 SOCIAL CREDITS 🚨")
        .setDescription(`${string} social credits for ${usrstr}!`)
        .addFields(
            { name: "Reason", value: reason }
        )
        .setImage(getGif(credits))
        .setTimestamp()
}

export async function grantSocialCreditstoUsers(targets: User[], credits: number) {
    for(var i = 0; i < targets.length; i++) {
        grantSocialCredits(targets[i], credits)
    }
}
