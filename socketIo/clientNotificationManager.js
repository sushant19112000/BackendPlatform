 class CleintNotificationManager {
    constructor(io) {
        this.io = io;
    }
   
    sendNotification(type, data) {
        let message;
         
        switch (type) {
            case 'added':
                message = `New Client "${data.name}" has been created.`;
              
                break;
            case 'updated':
                message = `Client "${data.name}" has been updated.`;
                break;
            case 'deleted':
                message = `Client "${data.name}" has been deleted.`;
                break;
            default:
                message = `Client "${data.name}" has been changed.`;
        }

        this.io.emit('receiveClientNotification', {
            type,
            message,
            payload: data
        });
    }
}

module.exports=CleintNotificationManager;