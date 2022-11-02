import { Meteor } from 'meteor/meteor'
import { WebApp } from "meteor/webapp"
import { AudioFiles } from '/imports/api/audio'
import { fs } from 'file-system'
import wavFileInfo from "wav-file-info"

WebApp.connectHandlers.use(async (req, res, next) => {
    if (req.url === '/post' && req.method == "POST") {
        
        const cd_header = req.headers['content-disposition']
        const filename = cd_header.substring(cd_header.indexOf("'") + 1, cd_header.lastIndexOf("'"))

        if (fs.existsSync(`${process.env.PWD}/files/${filename}`)) {
            res.writeHead(200, {'Content-Type': 'text/html'})
            res.end(`${filename} already exists, please rename.\n`)
            return
        }
        
        var data = []

        req.on('data', function(dataChunk) {
            data.push(dataChunk)
        })
        
        req.on('end', function() {
            const buf = Buffer.concat(data).toString('base64')
            fs.writeFileSync(`${process.env.PWD}/files/${filename}`, buf, 'base64')
            res.writeHead(200, {'Content-Type': 'text/html'})
            res.end(`${filename} saved.\n`)
            return
        })
    }
    else if (req.url.split("?")[0] === '/download' && req.method == 'GET') {
        
        if (Object.keys(req.query).length === 0) {
            res.statusCode = 200
            res.end("No file to download!\n")
            return
        }
        
        const file = req.query.name
        
        fs.readFile(`${process.env.PWD}/files/${file}`, function(err, data) {
            if (err) {
                // console.log(err)
                res.writeHead(200, { 'Content-Type' : 'text/html' })
                res.end(file + " not found.")
                return
            }
            res.writeHead(200, { 'Content-Type' : 'text/html' })
            res.end(data)
            return
        })
    }
    else if (req.url === '/list' && req.method == 'GET') {

        if (Object.keys(req.query).length > 0) {
            console.log(req.query)
        }

        const list = { files: [] }
        
        fs.readdirSync(`${process.env.PWD}/files/`).forEach(file => {
            list.files.push(file)
        })
        
        res.statusCode = 200
        res.end(JSON.stringify(list, null, 2) + "\n")
        return
    }
    else if (req.url.split("?")[0] === '/info' && req.method == 'GET') {
        
        if (!('name' in req.query) || req.query.name === "") {
            res.statusCode = 200
            res.end("ERROR: No filename provided.\n")
            return
        }

        const filename = req.query.name
        
        if (!(fs.existsSync(`${process.env.PWD}/files/${filename}`))) {
            res.writeHead(200, {'Content-Type': 'text/html'})
            res.end(`${filename} does not exist.\n`)
            return
        }
        
        wavFileInfo.infoByFilename(`${process.env.PWD}/files/${filename}`, function(err, info) {
            if (err) throw err
            const metadata = info.header
            metadata.duration = parseFloat(info.duration.toFixed(2))
            res.statusCode = 200
            res.end(JSON.stringify(metadata, null, 2) + "\n")
            return
        })
    }
    else {
        next()
    }
})
