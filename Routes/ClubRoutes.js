const ClubController=require('../Controllers/ClubController')
const express=require('express')
const ClubRouter=express.Router()
const uploadClub=require('../Middleware/uploadClub')
const MessageController=require('../Controllers/MessageController');

ClubRouter.post('/createClub',uploadClub.single('image'),ClubController.createClub);
ClubRouter.get('/allClubs',ClubController.getAllClubs);
ClubRouter.get('/fetchClub/:id',ClubController.getClubById);
ClubRouter.post('/joinClub/:studentId/:clubId',ClubController.joinClub);
ClubRouter.post('/leaveClub/:studentId/:clubId',ClubController.leaveClub);
ClubRouter.delete('/deleteClub/:clubId',ClubController.deleteClub);
ClubRouter.post('/reportClub',ClubController.reportClub);
ClubRouter.get('/fetchClubs',ClubController.fetchAllClubs);

// Fetch messages
ClubRouter.get("/clubs/:clubId/messages",MessageController.getClubMessages);
// Send message
ClubRouter.post("/clubs/:clubId/messages",MessageController.sendClubMessage);

module.exports=ClubRouter;