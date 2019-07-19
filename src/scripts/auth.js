const Cloudant = require('@cloudant/cloudant');
const cloudant = Cloudant({
    account:"ServiceId-3433c9c5-2f5e-46a5-8a60-f899ff657dac",
    key:"iernstiverstrybitsichadv",
    password:"f2b5d372dc13bb39e3c2c94e8866b42e9ef858d3",
    url:"https://a2777322-7e2f-4f00-88ff-5544d827c57f-bluemix.cloudant.com"
});
const userDB = cloudant.db.use('users');
const bcrypt = require('bcrypt');
const User = require('./classes/User');
const uuidv4 = require('uuid/v4');


/**
 * Creates a password hash
 * @param {string} password
 * @returns {string}
 */
function hashPass(password){
    return bcrypt.hashSync(password, 10);
}

/**
 * Checks a password against a hash
 * @param {string} password
 * @param {string} hashedPassword
 * @returns {boolean}
 */
function checkPass(password,hashedPassword){
    return (bcrypt.compareSync(password, hashedPassword));
}

/**
 * Creates a new User instance and gets data from the DB.
 * @param {string} uid
 * @throws {Promise<error>} - Promise Reject with error
 * @returns {Promise<User>} - Promise Resolve with new User instance
 */
function fetchUser(uid){
    let newUser = new User({uid:uid});
    console.log(newUser);

    return newUser.get().then(() => {
        return Promise.resolve(newUser);
    }).catch(err => {
        return Promise.reject(err);
    });
}

/**
 * Retrieves a UID from an email
 * @param {string} email
 * @throws {Promise<error>} - If more than one user exist, or if another error occurs.
 * @returns {Promise<uid>} - If user does not exist, -1 is returned instead
 */
function uidFromEmail(email){
    return userDB.find({selector: {email: email}}).then(result => {

        // No matching users
        if(result.docs.length === 0){
            return Promise.resolve(-1);
        }

        // More than one matching users
        if(result.docs.length > 1){
            return Promise.reject(Error('More than one user with that email exists.'));
        }

        // Exactly one matching user
        return Promise.resolve(result.docs[0]._id);
    }).catch(err => {
        return Promise.reject(err);
    })
}

/**
 * Logs a user in
 * @param {string} email
 * @param {string} pass
 * @param {object} req
 * @returns {Promise<T>}
 */
function loginUser(email,pass,req){

    // Get the UID
    return uidFromEmail(email).then(dbUID=>{

        if(dbUID == -1){
            return Promise.reject('Invalid email');
        }

        // Init a User
        let newUser = new User({uid:dbUID});

        // Get the User Data
        return newUser.get().then(() => {

            // Check the password
            if(newUser.validatePassword(pass)){
                req.session.loggedIn = true;
                req.session.userData = newUser;
                return Promise.resolve(newUser);
            }else{
                return Promise.reject('Bad Password');
            }
        }).catch(err => {
            return Promise.reject(err);
        });
    }).catch(err => {
        return Promise.reject(err);
    });
}

/**
 * Registers a new user
 * @param {object} req
 * @param {object} res
 */
function register(req,res) {

    // TODO: Validate

    let uid = uuidv4();
    const userData = {
        uid: uid,
        fName: req.body.fName,
        lName: req.body.lName,
        dName: req.body.fName + ' ' + req.body.lName,
        org: req.body.organization,
        email: req.body.email,
        pass: req.body.pass1
    };

    // Check if user w/ same email exists
    uidFromEmail(req.body.email).then(dbUID=>{
        if(dbUID !== -1){
            res.send('A user with that email already exists.');
        }else{

            // Create the user
            let newUser = new User(userData);
            newUser.push().then(() => {

                // Login
                loginUser(userData.email,userData.pass,req).then(()=>{
                    res.redirect('/index');
                }).catch(err => {
                    res.send(err);
                });

            }).catch((err) => {
                console.log(err);
                res.send(err);
            });
        }
    }).catch(err=>{
        res.send(err);
    });
}

module.exports = {
    loginUser,
    register,
    fetchUser
};