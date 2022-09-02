const Joi=require('joi');



const regVal = data =>{
const schema= Joi.object({
    name: Joi.string().min(6).required(),
    username: Joi.string().min(6).required(),
    email: Joi.string().min(6).required().email(),
    password: Joi.string().min(6).required(),
    confirm_password: Joi.string().min(6).required(),
    role: Joi.string().min(1).max(1).required() //valid('admin')

});
return schema.validate(data);
}


const logVal= data =>{
    const schema= Joi.object({
    username: Joi.string().min(6).required(),
    password: Joi.string().min(6).required()
    
    }); 
    return schema.validate(data); 
}

const changePass= data=>{
    const schema= Joi.object({
    email: Joi.string().min(6).required().email(),
    password: Joi.string().min(6).required(),
    newEmail: Joi.string().min(6).required().email()
        
    }); 
    return schema.validate(data);     
}
const read=data=>{
    const schema= Joi.object({
        email: Joi.string().min(6).required().email(),
        role: Joi.string().min(1).max(1).required()
    })
    return schema.validate(data); 
}


module.exports.regVal = regVal;
module.exports.logVal = logVal;
module.exports.changePass = changePass;
module.exports.read=read;
