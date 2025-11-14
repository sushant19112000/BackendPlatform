var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors')


const onlineUsers = new Map(); // or use an object {}
const HOST = '0.0.0.0'; // Bind to IP
const port = 3000
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: "*",   // Allow all origins
    methods: ["GET", "POST"]
  }
});

var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
var clientRouter = require('./routes/cleints');
var campaignRouter = require('./routes/campaigns')
var leadRouter = require('./routes/leads')
var notificationRouter = require('./routes/notifications')
var bulkUploadRouter = require('./routes/bulkUpload')
var pacingRouter = require('./routes/pacings')
var pacingReportRouter = require('./routes/pacingReports')
var authRouter = require('./routes/auth');
var messagesRouter = require('./routes/messages')
var usersRouter = require('./routes/users')
var volumeRouter = require('./routes/volumes')
var uploadsRouter = require('./routes/leadUploads')
var sessionRouter= require('./routes/session.js')
const { authenticate } = require('./middelware/authenticate');
const bulkUpload = require('./services/leadService/bulkUpload');
const briefRouter= require('./routes/brief.js')
const taskRouter=require('./routes/tasks')
const CampaignNotificationManager = require('./socketIo/campaignNotificationManager.js');
const CleintNotificationManager = require('./socketIo/clientNotificationManager.js');
const leaveRouter= require('./routes/leave.js')

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
// enabling CORS for any unknown origin(https://xyz.example.com)
const allowedOrigins = [
  'http://localhost:5173'
];


app.use((req, res, next) => {
    req.io = io;
    next();
});
app.use(cors({
  origin: "*"
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
// app.use('/users', usersRouter);
app.use('/bulk-upload', bulkUploadRouter);
app.use('/auth', authRouter);
app.use('/clients', clientRouter);
app.use('/campaigns', campaignRouter);
app.use('/leads', leadRouter);
app.use('/notifications', notificationRouter)
app.use('/pacings', pacingRouter)
app.use('/leadUploads', uploadsRouter)
app.use('/pacingsReport', pacingReportRouter)
app.use('/messages', messagesRouter)
app.use('/users',  usersRouter)
app.use('/volumes', volumeRouter)
app.use('/session',sessionRouter)
app.use('/tasks',taskRouter)
app.use('/briefs',briefRouter)
app.use('/leaves',leaveRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});


// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


io.on("connection", (socket) => {
  console.log("User connected ", socket.id); // Log the socket ID of the connected user

  // socket.on('addUser', (userId) => {
  //   onlineUsers.set(userId, socket.id);
  // });

  socket.on('disconnect', () => {
    for (const [userId, sockId] of onlineUsers.entries()) {
      if (sockId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
  });

  //campaign 
  const campaignNotifier = new CampaignNotificationManager(io);

  socket.on('campaignAdded', (data) => {
    campaignNotifier.sendNotification('added', data);
  });

  socket.on('campaignUpdated', (data) => {
    campaignNotifier.sendNotification('updated', data);
  });

  socket.on('campaignDeleted', (data) => {
    campaignNotifier.sendNotification('deleted', data);
  });

  //client 
  const clientNotifier = new CleintNotificationManager(io);

  socket.on('clientAdded', (data) => {
    console.log(data,'in constructor')
    clientNotifier.sendNotification('added', data);
  });

  socket.on('clientUpdated', (data) => {
    clientNotifier.sendNotification('updated', data);
  });

  socket.on('clientDeleted', (data) => {
    clientNotifier.sendNotification('deleted', data);
  });
  
  // socket.on('session-start',(data)=>{
      
  // })
  // socket.emit('session-log',(data)=>{
  //    // emit heartbeat
     
  // })
  // socket.on('session-end',(data)=>{

  // })
  //   // --- Trigger test notifications for this client ---
  // const testCampaign = { id: 999, name: "Test Campaign" };

  // // Trigger "added" after 2 seconds
  // setTimeout(() => {
  //   campaignNotifier.sendNotification('added', testCampaign);
  // }, 2000);

  //  //   // --- Trigger test notifications for this client ---
  // const testClient= { id: 999, name: "Test Client" };

  // // Trigger "added" after 2 seconds
  // setTimeout(() => {
  //   console.log('notification triggered')
  //   clientNotifier.sendNotification('added', testClient);
  // }, 2000);

  // // Trigger "updated" after 4 seconds
  // setTimeout(() => {
  //   campaignNotifier.sendNotification('updated', testCampaign);
  // }, 4000);

  // // Trigger "deleted" after 6 seconds
  // setTimeout(() => {
  //   campaignNotifier.sendNotification('deleted', testCampaign);
  // }, 6000);
  //
  // // Listen for "send_message" events from the connected client
  // socket.on("send_message", (data) => {
  //   console.log("Message Received ", data); // Log the received message data

  //   // Emit the received message data to all connected clients
  //   io.emit("receive_message", data);
  // });

  // // Listen for "send_message" events from the connected client
  // socket.on("send_message_to_group", (data) => {
  //   console.log("Message Received ", data); // Log the received message data

  //   // Emit the received message data to all connected clients
  //   io.emit("receive_message_in_group", data);
  // });

});


server.listen(3000, '0.0.0.0', () => {
  console.log('listening on *:3000');
});
// module.exports = app;
