const express = require("express")
const app = express()
const cors = require("cors")
const dotenv = require("dotenv")

dotenv.config()

const PORT = process.env.PORT

const http = require("http")
const server = http.createServer(app)
const { Server } = require("socket.io")
const io = new Server(server, { cors: { origin: "*" } })
global.io = io

app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
    res.send("Socket API")
})

let messages = [
    {
        message: "ini message 1"
    },
    {
        message: "ini message 2"
    },
    {
        message: "ini message 3"
    }
]

io.on("connection", (socket) => {
    console.log("user connected")
    socket.emit("INIT_MESSAGES", messages)

    socket.on("my-event", () => {
        console.log("Event trigger")
        console.log(data)
    })
})

server.listen(PORT, () => {
    console.log("Listening in port", PORT)
})