import { Meteor } from 'meteor/meteor'
import { WebApp } from "meteor/webapp"
import { AudioFiles } from '/imports/api/audio'
import { fs } from 'file-system'

WebApp.connectHandlers.use(async (req, res, next) => {
    if (req.url === '/post' && req.method == "POST") {
        var cd_header = req.headers['content-disposition']
        var filename = cd_header.substring(cd_header.indexOf("'") + 1, cd_header.lastIndexOf("'"))
        var data = []
        req.on('data', function(dataChunk) {
            data.push(dataChunk)
        })
        req.on('end', function() {
            var buf = Buffer.concat(data).toString('base64')
            fs.writeFileSync(`${process.env.PWD}/files/${filename}`, buf, 'base64')
            res.writeHead(200, {'Content-Type': 'text/html'})
            res.end(`${filename} saved.`)
        })
    }
    else if (req.url === '/list' && req.method == 'GET') {
        const list = { files: [] }
        fs.readdirSync(`${process.env.PWD}/files/`).forEach(file => {
            list.files.push(file)
        })
        res.statusCode = 200
        res.end(JSON.stringify(list, null, 2) + "\n")
    }
    else if (req.url.split("?")[0] === '/info' && req.method == 'GET') {
        if (Object.keys(req.query).length === 0) {
            res.statusCode = 200
            res.end("No file to query!")
        }
        const file = req.query.name
        res.statusCode = 200
        res.end(metadata)
    }
    else if (req.url.split("?")[0] === '/download' && req.method == 'GET') {
        if (Object.keys(req.query).length === 0) {
            res.statusCode = 200
            res.end("No file to download!")
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
    else {
        next()
    }
})
