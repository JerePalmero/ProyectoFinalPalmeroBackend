import {Router} from 'express'
import passport from 'passport';
import { current, empty, githubcallback, goPremium, login, logout, recoverPass, recoverPassAction, register, reminder } from '../controllers/session.controller.js';
import { authorization, passportCall } from '../passport_custom.js';

const router = Router()

router.post('/register', passport.authenticate('register', {session:false, failureRedirect:'/views/failregister'}), register)

router.post('/login', passport.authenticate('login', {session:false, failureRedirect:'/views/faillogin'}), login)

router.get('/login-github', passport.authenticate('github'), empty)

router.get('/githubcallback', passport.authenticate('github', {session:false, failureRedirect:'/views/faillogin'}), githubcallback)

router.get('/logout', logout)

router.get('/current',  passport.authenticate('current', {session:false}), current)

router.post('/reminder', reminder)

router.get('/recoverPass/:token', recoverPass)

router.post('/recoverPassAction/:token', recoverPassAction)

router.get('/premium/:uid', passportCall('current', {session:false, failureRedirect:'/views/login'}),authorization(['ADMIN']), goPremium)

export default router;