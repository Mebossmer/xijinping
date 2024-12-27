import { Channel, Client, Events, GatewayIntentBits, GuildBasedChannel, GuildMember, Message } from "discord.js"
import { token } from "../config.json"
import { deployCommands, handleCommand } from "./commandregistry"
import { handleFilter } from "./filter"
import { BIGINT, INTEGER, Sequelize, STRING } from "sequelize"
import { getSocialCreditsEmbed, grantSocialCredits } from "./creditshelper"
import { getTimeString } from "./utils"
import winston from "winston"


declare global {
    interface BigInt {
        toJSON(): Number
    }
}
BigInt.prototype.toJSON = () => { return Number(this) }


interface TimerInfo {
   msg?: Message
   interval?: NodeJS.Timeout 
   startTime?: Date
   time?: Date
   target?: GuildMember
   channel?: GuildBasedChannel
   active: boolean
}

export const LOGGER = winston.createLogger({
    level: "info",
    format: winston.format.cli(),
    defaultMeta: { service: "user-service" },
    transports: [
        new winston.transports.File({ filename: "info.log" }),
        new winston.transports.Console()
    ]
})

export var TIMERINFO: TimerInfo = { active: false }

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessagePolls,
    ]
})

const sequelize = new Sequelize("database", "user", "password", {
    host: "localhost",
    dialect: "sqlite",
    logging: false,
    storage: "socialcredits.sqlite"
})

export const USERSTATS = sequelize.define("credits", {
    name: {
        type: STRING,
        unique: true
    },
    credits: INTEGER,
    lashes: INTEGER,
    lateRecord: BIGINT
})


client.once(Events.ClientReady, async readyClient => {
    LOGGER.info(`Logged in as ${readyClient.user.tag}`)
    
    USERSTATS.sync()
    deployCommands(readyClient)
})

client.on(Events.InteractionCreate, async interaction => {
    if(interaction.isCommand()) {
        await handleCommand(client, interaction)
    }
})

client.on(Events.VoiceStateUpdate, async(oldVoiceState, newVoiceState) => {
    if(!TIMERINFO) {
        return
    }

    if(!TIMERINFO.active) {
        return
    }

    if(!newVoiceState) {
        return
    }

    if(newVoiceState.channel?.id != TIMERINFO.channel?.id) {
        return
    }

    if(newVoiceState.member?.id != TIMERINFO.target?.id) {
        return
    }

    TIMERINFO.active = false

    clearInterval(TIMERINFO.interval)

    if(!TIMERINFO.target?.user) {
        return
    }

    if(!TIMERINFO.time) {
        return
    }

    var reason: string = `${getTimeString(TIMERINFO.time)} too late!!!`

    var element = await USERSTATS.findOne({ where: {name: TIMERINFO.target.id} })
    if(!element) {
        element = await USERSTATS.create({
            name: TIMERINFO.target.id,
            credits: 0,
            lashes: 0,
            lateRecord: TIMERINFO.time.getTime()
        })
        
        reason = `NEW PERSONAL RECORD: ${TIMERINFO.target.user} was ${getTimeString(TIMERINFO.time)} too late!!!`
    } else {
        if(TIMERINFO.time.getTime() > (element?.get("lateRecord") as number)) {
            element.set("lateRecord", TIMERINFO.time.getTime())

            reason = `NEW PERSONAL RECORD: ${TIMERINFO.target.user} was ${getTimeString(TIMERINFO.time)} too late!!!`
        }
    }

    const credits = Math.round(-(TIMERINFO.time?.getTime() / 1000) * 15)

    TIMERINFO.active = false

    await grantSocialCredits(TIMERINFO.target?.user, credits)

    TIMERINFO.msg?.edit({ embeds: [await getSocialCreditsEmbed(TIMERINFO.target.user, credits, reason)] })
})

client.on(Events.MessageCreate, async message => {
    handleFilter(client, message)
})

client.login(token)
