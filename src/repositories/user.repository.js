import UserDTO from "../dao/DTO/users.dto.js";
import { generateToken, verifyUser } from "../jwt_utils.js";
import Mail from "../modules/mails.js";
class UserRepository{

    constructor(dao){
        this.dao = dao;
        this.mail = new Mail();
    }

    get = async (username) => {
        return await this.dao.get(username)
    }

    getOne = async (parameter) => {
        return await this.dao.getOne(parameter); 
    }

    getbyId = async (id) => {
        return await this.dao.getbyId(id); 
    }

    getCurrent = async (user) => {
        const userToShow = new UserDTO(user).current()
        return userToShow; 
    }

    create = async (userTemplate) => {
        const userToInstert = new UserDTO(userTemplate);
        return await this.dao.create(userToInstert)
    }

    update= async (id,updatedUser) => {
        return await this.dao.update(id,updatedUser)
    }   
    delete = async (id) => {
        return await this.dao.deleteOne(id)        
    }
    reminder = async(email)=>{
        const user = await this.dao.getOne({email: email})
        if (!user) {
            return {error:"No hay usuario con ese correo"}
        }
        const token = generateToken(user)
        let html = `<h1> Recupere su contraseña: </h1>
        <h2><a href="http://127.0.0.1:8080/session/recoverPass/${token}">Link de recuperación</a><h2>
        `
        
        //send email
        const result = this.mail.send(user, "Recupere su contraseña", html)
        return {message: "Correo enviado"}
    }
    recoverPass = async (token) => {
        const user = verifyUser(token)
        return user
    }
    goPremium = async (uid) => {
        const user = await this.dao.getbyId(uid)
        if (user.role == 'premium'){
            user.role = 'user'
            await this.dao.update(user._id, user)
        } else  if (user.role == 'user'){
            user.role = 'premium'
            await this.dao.update(user._id, user)
        }
        return user
    }
    

}

export default UserRepository