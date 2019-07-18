const Cloudant = require('@cloudant/cloudant');
const cloudant = Cloudant({
    account:"ServiceId-3433c9c5-2f5e-46a5-8a60-f899ff657dac",
    key:"iernstiverstrybitsichadv",
    password:"f2b5d372dc13bb39e3c2c94e8866b42e9ef858d3",
    url:"https://a2777322-7e2f-4f00-88ff-5544d827c57f-bluemix.cloudant.com"
});
const userDB = cloudant.db.use('users');

const bcrypt = require('bcrypt');

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

const uuidv4 = require('uuid/v4');

/**
 * An individual user
 * @class
 *
 */
class User{
    /**
     * User constructor
     * @param {object} userData - An object containing data to create the user with
     */
    constructor (userData = {}){
        this.uid = userData.uid;
        this.fName = userData.fName;
        this.lName = userData.lName;
        this.dName = userData.fName + ' ' + userData.lName;
        this.email = userData.email;
        this.org = userData.org;

        // Process password
        if(userData.pass !== undefined){
            if(userData.pass.length !== 60){
                // Probably not hashed as hashed passwords are 60 chars long
                this.pass = hashPass(userData.pass)
            }else{
                this.pass = userData.pass;
            }
        }else{
            this.pass = undefined;
        }
    }

    /**
     * Fills User with data from DB
     * @param uid
     * @returns {Promise}
     */
    get(uid){
        // Allow a uid to be passed w/ get method
        if (uid !== undefined){
            this.uid = uid;
        }

        return userDB.get(this.uid).then(data => {

            this.fName = data.fName;
            this.lName = data.lName;
            this.dName = data.dName;
            this.email = data.email;
            this.org = data.org;
            this.pass = data.pass;
            this._id = data._id;
            this._rev = data._rev;

            return Promise.resolve(this);
        }).catch(err => {
            return Promise.reject(err);
        });
    }

    /**
     * Pushes User info to the DB
     * @returns {Promise<this>}
     */
    push(){
        // Ensure all values are filled
        if(this.uid === undefined){
            return Promise.reject('uid is undefined. Cannot push to DB.');
        }
        if(this.fName === undefined){
            return Promise.reject('fName is undefined. Cannot push to DB.');
        }
        if(this.lName === undefined){
            return Promise.reject('lName is undefined. Cannot push to DB.');
        }
        if(this.dName === undefined){
            return Promise.reject('dName is undefined. Cannot push to DB.');
        }
        if(this.email === undefined){
            return Promise.reject('email is undefined. Cannot push to DB.');
        }
        if(this.org === undefined){
            return Promise.reject('org is undefined. Cannot push to DB.');
        }
        if(this.pass === undefined){
            return Promise.reject('pass is undefined. Cannot push to DB.');
        }

        // Object to send to DB
        let userData = {
            uid: this.uid,
            fName: this.fName,
            lName: this.lName,
            dName: this.dName,
            email: this.email,
            org: this.org,
            pass: this.pass
        };

        return this.existsInDB().then(exists => {
            console.log('Exists: ' + exists);
            if(exists === false){
                // Update Record
                if(this._id === undefined || this._rev === undefined){
                    return Promise.reject(Error('Missing required _id and _rev vars for user update'))
                }

                // Insert vars required for update
                userData._id = this._id;
                userData._rev = this._rev;
            }

            // Send to DB
            return userDB.insert(userData, this.uid).then(() => {
                return Promise.resolve('Pushed to DB');
            }).catch((err) => {
                return Promise.reject(Error(err));
            });
        }).catch(err => {
            return Promise.reject(err);
        });
    }

    /**
     * Check if param password is correct
     * @param password
     * @returns {boolean}
     */
    validatePassword(password){
        return (bcrypt.compareSync(password, this.pass));
    }

    /**
     * Checks if user is in DB
     * @param {string} uid - Optional
     * @returns {Promise<boolean>}
     */
    existsInDB(uid){
        if (uid === undefined){
            uid = this.uid;
        }
        console.log('Checking if ' + uid + ' exists in DB.');

        return userDB.find({selector: {"uid": {"$eq":uid}}}).then(result => {

            // No matching users
            if(result.docs.length === 0){
                return Promise.resolve(false);
            }

            // Exactly one matching user
            return Promise.resolve(true);
        }).catch(err => {
            return Promise.reject(err);
        });

    }
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