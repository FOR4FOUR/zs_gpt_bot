import { createWriteStream } from 'fs'
import ffmpeg from 'fluent-ffmpeg'
import {dirname, resolve} from 'path'
import {fileURLToPath} from 'url'
import {removeFile} from "./utils.js";

const __dirname = dirname(fileURLToPath(import.meta.url))

class OggConverter {
    constructor() {
        // Use system ffmpeg available in PATH (installed via Docker)
    }

    toMp3(input, output) {
        try{
            const outputPath = resolve(dirname(input), `${output}.mp3`)
            return new Promise((resolve,reject) => {
                ffmpeg(input)
                    .inputOptions('-t 30')
                    .output(outputPath)
                    .on('end', () => {
                        removeFile(input)
                        resolve(outputPath)
                    })
                    .on('error', (err) => reject(err.message))
                    .run()
            })
        } catch(e) {
            console.log('Error while creating mp3', e.message)
        }
    }

    async create(url, filename) {
        try {
            const oggPath = resolve(__dirname, '../voices', `${filename}.ogg`)
            const res = await fetch(url)
            if (!res.ok || !res.body) throw new Error(`Failed to download ogg: ${res.status}`)
            return new Promise((resolve) => {
                const fileStream = createWriteStream(oggPath)
                res.body.pipe(fileStream)
                fileStream.on('finish', () => resolve(oggPath))
            })
        } catch (e) {
            console.log('Error while creating ogg', e.message)
        }
    }
}


export const ogg = new OggConverter()

