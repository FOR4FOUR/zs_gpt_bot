import { Telegraf, session } from 'telegraf'
import { message } from 'telegraf/filters'
import { code } from 'telegraf/format'
import config from 'config'
import {ogg} from "./ogg.js"
import {openai} from "./openai.js";

const INITIAL_SESSION = {
    messages: []
}

const bot = new Telegraf(config.get('TELEGRAM_TOKEN'))

bot.use(session())

bot.command('new', async (ctx) => {
    ctx.session = INITIAL_SESSION
    await ctx.reply('Жду вашего сообщения')
})

bot.command('start', async (ctx) => {
    ctx.session = INITIAL_SESSION
    await ctx.reply('Жду вашего сообщения')
})

bot.on(message('voice'), async (ctx) => {
    ctx.session ??= INITIAL_SESSION
    try{
        await ctx.reply(code('Жду ответ сервера'))
        const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)  //получаем ссылку на голосовое сообщение
        const userId = String(ctx.message.from.id) // id пользователя Telegram
        const oggPath = await ogg.create(link.href, userId) // ссылка на ogg-файл
        const mp3Path = await ogg.toMp3(oggPath, userId) // ссылка на mp3-файл

        const text = await openai.transcription(mp3Path) // расшифрованный текст голосового сообщения
        await ctx.reply(code(`Ваше голосовое в тексте: ${text}`))

        ctx.session.messages.push({role: openai.roles.USER,content: text})

        const response = await openai.chat(ctx.session.messages)

        ctx.session.messages.push({role: openai.roles.ASSISTANT,content: response.content})

        await ctx.reply(response.content)
    } catch(e) {
        console.log('Error while voice message', e.message)
    }
})

bot.on(message('text'), async (ctx) => {
    ctx.session ??= INITIAL_SESSION
    try{
        await ctx.reply(code('Жду ответ сервера'))

        ctx.session.messages.push({
            role: openai.roles.USER,
            content: ctx.message.text
        })

        const response = await openai.chat(ctx.session.messages)

        ctx.session.messages.push({
            role: openai.roles.ASSISTANT,
            content: response.content
        })

        await ctx.reply(response.content)
    } catch(e) {
        console.log('Error while voice message', e.message)
    }
})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))