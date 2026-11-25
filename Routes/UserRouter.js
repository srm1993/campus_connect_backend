const UserController=require('../Controllers/UserController');
const EventController=require('../Controllers/EventController');
const uploadEvent=require('../Middleware/uploadEvent');
const RegisterEventModel=require('../Models/RegisterEvent');
const express=require('express')
const UserRouter=express.Router()
UserRouter.post('/createUser',UserController.createUser);
UserRouter.post('/loginUser',UserController.loginUser);

UserRouter.get('/allUser',UserController.allUser);
UserRouter.get('/allFaculty',UserController.allFaculty);
UserRouter.get('/changeStatus/:id',UserController.changeStatus);
UserRouter.post('/createEvent',uploadEvent.single('image'),EventController.createEvent);
UserRouter.get('/allEvent',EventController.allEvent);
UserRouter.delete('/deleteEvent/:id',EventController.deleteEvent);
UserRouter.post('/registerEvent',EventController.registerEvent);
module.exports=UserRouter;