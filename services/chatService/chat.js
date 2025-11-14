const prisma = require('../../db/dbConnection');


const fetchUserMessages = async (userId) => {
    try {
        const users = await prisma.user.findMany({
            where: {
                id: {
                    not:userId
                }
            }, 
            select: { id: true, name: true }
        })
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { recipientId: userId }
                ]
            },
            orderBy: {
                created_at: 'desc' // assuming you have a timestamp
            }
        });

        const conversations = {}

        const makeKey = (userId, recipientId) => {
            return `${userId}-${recipientId}`
        }

        for (let m in messages) {
            let tempKey;
            let msg = messages[m]

            if (msg.senderId == userId) {

                tempKey = msg.recipientId
            }
            else {
                tempKey = msg.senderId
            }
            if (tempKey in conversations) {
                conversations[tempKey].push(msg)
            }
            else {
                conversations[tempKey] = [msg]
            }
        }
        
        return { conversations, users };
    }
    catch (e) {
        console.log(e);
    }
}

// model message {
//   id          Int       @id @default(autoincrement())
//   body        String
//   senderId    Int
//   sender      user      @relation("SentMessages", fields: [senderId], references: [id])
//   recipientId Int
//   recipient   user      @relation("ReceivedMessages", fields: [recipientId], references: [id])
//   created_at  DateTime  @default(now())
//   read_at     DateTime?
// }

const fetchSingleMessage = async () => {
    try {
        console.log('fetchSingleMessage')
    }
    catch (e) {
        console.log(e)
    }
}

const postMessage = async () => {
    try {
        // trigger event and save to db 
        console.log('post message')
    }
    catch (e) {
        console.log(e);
    }
}

const deleteMessage = async () => {
    try {
        console.log('delete Message')
    }
    catch (e) {
        console.log(e);
    }
}

module.exports = { fetchUserMessages };