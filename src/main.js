import { Telegraf, session } from 'telegraf'
import { message } from 'telegraf/filters'
import { code } from 'telegraf/format'
import config from 'config'
// lazy import to avoid loading ffmpeg until needed
import {openai} from "./openai.js";

const MAX_HISTORY_MESSAGES = 12
const INITIAL_SESSION = { messages: [] }

function getTrimmedHistory(messages) {
    if (!Array.isArray(messages) || messages.length <= MAX_HISTORY_MESSAGES) return messages || []
    return messages.slice(-MAX_HISTORY_MESSAGES)
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
        const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
        const userId = String(ctx.message.from.id) // id пользователя Telegram
        const { ogg } = await import('./ogg.js')
        const oggPath = await ogg.create(link.href, userId)
        const mp3Path = await ogg.toMp3(oggPath, userId)

        const text = await openai.transcription(mp3Path) // расшифрованный текст голосового сообщения
        // cleanup mp3 after transcription to free disk space
        try { (await import('./utils.js')).removeFile(mp3Path) } catch {}
        await ctx.reply(code(`Ваше голосовое в тексте: ${text}`))

        ctx.session.messages.push({role: openai.roles.USER, content: text})
        ctx.session.messages = getTrimmedHistory(ctx.session.messages)
        const response = await openai.chat(ctx.session.messages)

        ctx.session.messages.push({role: openai.roles.ASSISTANT, content: response.content})

        await ctx.reply(response.content)
    } catch(e) {
        console.log('Error while voice message', e.message)
    }
})

bot.on(message('text'), async (ctx) => {
    ctx.session ??= INITIAL_SESSION
    try{
        await ctx.reply(code('Жду ответ сервера'))

        ctx.session.messages.push({ role: openai.roles.USER, content: ctx.message.text })
        ctx.session.messages = getTrimmedHistory(ctx.session.messages)
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

bot.launch({ dropPendingUpdates: true })

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))