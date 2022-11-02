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
            res.writeHead(404, {'Content-Type': 'text/html'})
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

        if (!('name' in req.query) || req.query.name === "") {
            res.writeHead(404, {'Content-Type': 'text/html'})
            res.end("ERROR: No filename provided.\n")
            return
        }
        
        const file = req.query.name

        if (!(fs.existsSync(`${process.env.PWD}/files/${file}`))) {
            res.writeHead(404, {'Content-Type': 'text/html'})
            res.end(`${file} does not exist.\n`)
            return
        }
        
        fs.readFile(`${process.env.PWD}/files/${file}`, function(err, data) {
            if (err) {
                // console.log(err)
                res.writeHead(404, { 'Content-Type' : 'text/html' })
                res.end(file + " not found.")
                return
            }
            res.writeHead(200, { 'Content-Type' : 'text/html' })
            res.end(data)
            return
        })
    }
    else if (req.url.split("?")[0] === '/list' && req.method == 'GET') {

        var minDuration = 0, maxDuration = Infinity, sort = "la"

        if (Object.keys(req.query).length > 0) {
            // console.log(Object.keys(req.query))
            if ("minduration" in req.query) {
                minDuration = parseFloat(req.query.minduration)
            }
            if ("maxduration" in req.query) {
                maxDuration = parseFloat(req.query.maxduration)
            }
            if ("sort" in req.query) {
                const type = req.query.sort
                switch (type) {
                    case "la":
                    case "ld":
                    case "da":
                    case "dd":
                        sort = type
                        break
                    default:
                        res.writeHead(200, { 'Content-Type' : 'text/html' })
                        res.end("ERROR: Invalid sort type.\n")
                        return
                }
            }
        }
        
        const list = { files: [] }

        const filesInMemory = fs.readdirSync(`${process.env.PWD}/files/`)

        filesInMemory.forEach((file, index) => {
            wavFileInfo.infoByFilename(`${process.env.PWD}/files/${file}`, function(err, info) {
                if (err) throw err
                const duration = parseFloat(info.duration.toFixed(2))
                if (duration <= maxDuration && duration >= minDuration) {
                    list.files.push({
                        filename: file,
                        duration
                    })
                }
                if (index == filesInMemory.length - 1) {
                    list.files.sort((a,b) => {
                        switch (sort) {
                            case "la":
                                if (a.filename < b.filename) return -1
                                if (a.filename == b.filename) return 0
                                return 1
                            case "ld":
                                if (a.filename > b.filename) return -1
                                if (a.filename == b.filename) return 0
                                return 1
                            case "da":
                                if (a.duration < b.duration) return -1
                                if (a.duration == b.duration) return 0
                                return 1
                            case "dd":
                                if (a.duration > b.duration) return -1
                                if (a.duration == b.duration) return 0
                                return 1
                        }
                    })
                    res.writeHead(200, {'Content-Type': 'text/html'})
                    res.end(JSON.stringify(list, null, 2) + "\n")
                    return
                }
            })
        })
    }
    else if (req.url.split("?")[0] === '/info' && req.method == 'GET') {
        
        if (!('name' in req.query) || req.query.name === "") {
            res.writeHead(404, {'Content-Type': 'text/html'})
            res.end("ERROR: No filename provided.\n")
            return
        }

        const filename = req.query.name
        
        if (!(fs.existsSync(`${process.env.PWD}/files/${filename}`))) {
            res.writeHead(404, {'Content-Type': 'text/html'})
            res.end(`${filename} does not exist.\n`)
            return
        }
        
        wavFileInfo.infoByFilename(`${process.env.PWD}/files/${filename}`, function(err, info) {
            if (err) {
                res.writeHead(404, {'Content-Type': 'text/html'})
                res.end("ERROR: " + JSON.stringify(err) + "\n")
                return
            }
            const metadata = info.header
            metadata.duration = parseFloat(info.duration.toFixed(2))
            res.writeHead(200, {'Content-Type': 'text/html'})
            res.end(JSON.stringify(metadata, null, 2) + "\n")
            return
        })
    }
    else {
        next()
    }
})
