 class CampaignNotificationManager {
    constructor(io) {
        this.io = io;
    }

    sendNotification(type, data) {
        let message;

        switch (type) {
            case 'added':
                message = `New campaign "${data.name}" has been created.`;
                break;
            case 'updated':
                message = `Campaign "${data.name}" has been updated.`;
                break;
            case 'deleted':
                message = `Campaign "${data.name}" has been deleted.`;
                break;
            default:
                message = `Campaign "${data.name}" has been changed.`;
        }

        this.io.emit('receiveCampaignNotification', {
            type,
            message,
            payload: data
        });
    }
}

module.exports=CampaignNotificationManager;