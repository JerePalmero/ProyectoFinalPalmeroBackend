import passport from "passport";
import local from 'passport-local';
import GitHubStrategy from 'passport-github2';
import jwt from "passport-jwt";
import fetch from 'node-fetch';


import { UserService } from "../repositories/index.js";
import { createHash, isValidPassword } from "../encrypt.js";
import { generateToken } from "../jwt_utils.js";
import config from "./config.js";

const JWTStrategy = jwt.Strategy
const ExtractJWT = jwt.ExtractJwt
const LocalStrategy = local.Strategy;


const cookieExtractor = req => {
    const token = req?.cookies['auth'] || req?.headers?.auth || null;
    req.logger.info('Cookie Extractor '+ token);
    return token;
}

const initializePassport= () => {

    passport.use('current',  new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
        secretOrKey: config.PRIVATE_KEY // DEBE SER LA MISMA que como la del JWT UTILS 
    },async (jwt_payload, done)=>{
        try {
            return done(null, jwt_payload)
        } catch (error) {
            return done(error)
        }
        
    }))

    passport.use('register', new LocalStrategy({
        passReqToCallback: true,
        usernameField: 'email',
    }, async (req, username, password, done)=>{
        
        const {first_name, last_name, email, age} = req.body;
            const user = await UserService.get(username);
            if (user){
                return done('Usuario ya existente en la base de datos', false)
            }
       
            const userTemplate = {
                first_name: first_name,
                last_name: last_name,
                email: email,
                password: createHash(password),
                age: age,
                cart: await fetch('http://127.0.0.1:8080/api/carts', {method:'POST'}).then(res=>res.json()).then(data=> data._id)

            }
            const newUser = await UserService.create(userTemplate)

            return done(null, newUser)

      
    }));

    passport.use('login', new LocalStrategy({
        usernameField: 'email',
    }, async (username, password, done)=>{
      
            const user = await UserService.get(username);
            if(!user){
                console.log('NO USER: No hay usuario registrado con ese email');
                return done(null, false)

            }
            if (!isValidPassword(user, password)){
                console.log('INCORRECT PASSWORD: Contraseña incorrecta');
                return done(null, false)
            }

            const token = generateToken(user)
            user.token = token

            return done(null, user)


    }));

    passport.use('github', new GitHubStrategy({
        clientID: 'Iv1.a921d6102a249409',
        clientSecret: '92c970321f572e81e1b4c19a40430aea1609d848',
        callbackURL: 'http://127.0.0.1:8080/session/githubcallback',
        scope:['user:email']
    },async(accessToken, refreshToken, profile, done)=>{
        console.log(profile);
        try {
            const user = await UserService.get(profile.emails[0].value);
            if (user) {
                const token = generateToken(user)
                user.token = token
                return done(null, user);
            }

            const userTemplate = {
                first_name:profile._json.name,
                last_name:'',
                email: profile.emails[0].value,
                password: '',
                age:'',
                cart: await fetch('http://127.0.0.1:8080/api/carts', {method:'POST'}).then(res=>res.json()).then(data=> data._id)
            }
            const newUser = await UserService.create(userTemplate)

            const token = generateToken(newUser)
            newUser.token = token
            return done(null, newUser)
        } catch (error) {
            return done('Error to login with GitHub: ',error)
            
        }
    }))

    passport.serializeUser((user, done)=>{
        done(null, user._id)
    });

    passport.deserializeUser(async(id, done)=>{
        const user = await UserService.getbyId(id);
        done(null, user)
    })


};

export default initializePassport;