import { Client, Events, GatewayIntentBits } from "discord.js"
import { token } from "../config.json"
import { deployCommands, handleCommand } from "./commandregistry"
import { handleFilter } from "./filter"
import { INTEGER, Sequelize, STRING } from "sequelize"


declare global {
    interface BigInt {
        toJSON(): Number
    }
}
BigInt.prototype.toJSON = () => { return Number(this) }


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessagePolls
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
    lashes: INTEGER
})

client.once(Events.ClientReady, async readyClient => {
    console.log(`Logged in as ${readyClient.user.tag}`)
    
    USERSTATS.sync()
    deployCommands(readyClient)
})

client.on(Events.InteractionCreate, async interaction => {
    if(interaction.isCommand()) {
        await handleCommand(client, interaction)
    }
})

client.on(Events.MessageUpdate, async message => {
    if(message.author?.tag == client.user?.tag) {
        if(!message.poll) {
            return
        }

        console.log("Poll??")
    }
})

client.on(Events.MessageCreate, async message => {
    handleFilter(message)
})

client.login(token)
