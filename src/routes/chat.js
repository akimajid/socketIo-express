const { nanoid } = require("nanoid")
const { Room, UserRoom, User, ChatMessages } = require("../lib/sequelize")

const router = require("express").Router()

router.post("/rooms", async (req, res) => {
    try {
        const { userIds } = req.body

        if (userIds.length <= 1) {
            throw new Error("Participant must be more than one")
        } 

        const createRoom = await Room.create({
            room_name: nanoid()
        })

        await UserRoom.bulkCreate(
            userIds.map((val) => {
                return {
                    user_id: val,
                    room_id: createRoom.id
                }
            })
        )

        return res.status(201).json({
            message: "Room created"
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            message: "Server error"
        })
    }
})

router.get("/rooms", async (req, res) => {
    try {
        const findRoomsWithUser = await Room.findAll({
            include: User
        })

        return res.status(200).json({
            message: "Find room with user",
            result: findRoomsWithUser
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            message: "Server error"
        })
    }
})

router.post("/message/room/:roomId", async (req, res) => {
    try {
        const { roomId } = req.params
        const { user_id, message } = req.body

        const findUserInRoom = await UserRoom.findOne({
            where: {
                user_id,
                room_id: roomId
            }
        })

        if (!findUserInRoom) {
            return res.status(400).json({
                message: "User you search not found"
            })
        }

        const newMessage = {
            message,
            user_id,
            room_id: roomId
        }

        await ChatMessages.create(newMessage)

        global.io.to(roomId.toString()).emit("NEW_MESSAGE", newMessage)

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            message: "Server error"
        })
    }
})

router.get("/rooms/:roomId/messages", async (req, res) => {
    try {
        const { roomId } = req.params

        const findMessages = await ChatMessages.findAll({
            where: {
                room_id: roomId
            },
            include: User
        })

        return res.status(200).json({
            message: "Find chat message",
            result: findMessages
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            message: "Server error"
        })
    }
})

module.exports = router