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
 * Class representing an individual User
 */
class User{
    /**
     * User constructor
     * @param {object=} userData - An object containing data to create the user with
     * @param {string=} userData.uid - The user's UID
     * @param {string=} userData.fName - The user's First Name
     * @param {string=} userData.lName - The user's Last Name
     * @param {string=} userData.email - The user's Email
     * @param {array=} userData.org - The user's Organizations (Array of org IDs)
     * @param {string=} userData.donorID - The user's associated donorID in the blockchain
     */
    constructor (userData = {}){
        console.log('Constructing User with data: ', userData);

        this.uid = userData.uid;
        this.fName = userData.fName;
        this.lName = userData.lName;
        this.dName = userData.fName + ' ' + userData.lName;
        this.email = userData.email;
        this.org = userData.org;
        this.donorID = userData.donorID;
        this._id = userData._id;
        this._rev = userData._rev;

        // Process password
        if(userData.pass !== undefined){
            if(userData.pass.length !== 60){
                // Probably not hashed as hashed passwords are 60 chars long
                this.pass = bcrypt.hashSync(userData.pass, 10);
            }else{
                this.pass = userData.pass;
            }
        }else{
            this.pass = undefined;
        }

        // Dependency Injection
        this.Org = require('./Org');
        this.utils = require('../utils');
    }

    /**
     * Fills User with data from DB
     * @param {string=} uid
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
            this.donorID = data.donorID;
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
            donorID: this.donorID,
            pass: this.pass
        };

        return this.existsInDB().then(exists => {
            console.log('Exists: ' + exists);
            if(exists !== false){
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
                return Promise.resolve(this);
            }).catch((err) => {
                return Promise.reject(Error(err));
            });
        }).catch(err => {
            return Promise.reject(err);
        });
    }

    /**
     * Check if param password is correct
     * @param {string} password
     * @returns {boolean}
     */
    validatePassword(password){
        return (bcrypt.compareSync(password, this.pass));
    }

    /**
     * Checks if user is in DB
     * @param {string=} uid - Optional
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

    /**
     * Adds the user to an organization
     * @param {string} oid
     * @returns {Promise}
     */
    makeMember(oid){

        // Input validation
        if(oid === undefined){
            return Promise.reject('oid to add is undefined');
        }

        // Check if user is a member
        if(this.org.includes(oid)){
            return Promise.resolve('User is already a member.');
        }

        let newOrg = new this.Org({oid:oid});
        return newOrg.get().then(()=>{

            // Add oid to User's org list
            this.org.push(oid);
            // Update DB
            return this.push();

        }).then(()=>{

            // Add uid to Org's members list
            return newOrg.addMember(this.uid);

        }).catch(err => {
            return Promise.reject(err);
        });
    }

    /**
     * Removes the user from an organization
     * @param {string} oid
     * @returns {Promise}
     */
    removeAsMember(oid){

        // Input validation
        if(oid === undefined){
            return Promise.reject('oid to remove is undefined');
        }

        // Check if user is a member
        if(this.org.indexOf(oid) === -1){
            return Promise.resolve('User is not a member.');
        }

        let newOrg = new this.Org({oid:oid});
        return newOrg.get().then(()=>{

            // Remove oid from User's org list
            this.org.splice(this.org.indexOf(oid));
            // Update DB
            return this.push();

        }).then(()=>{

            // Remove uid from Org's members list
            return newOrg.removeMember(this.uid);

        }).catch(err => {
            return Promise.reject(err);
        });

    }

    /**
     * Adds the user as an admin to an organization
     * @param {string} oid
     * @returns {Promise}
     */
    makeAdmin(oid){

        // Input validation
        if(oid === undefined){
            return Promise.reject('oid to use is undefined');
        }

        let newOrg = new this.Org({oid:oid});
        return newOrg.get().then(()=>{

            // Process in Org class
            return newOrg.addAdmin(this.uid);

        }).catch(err => {
            return Promise.reject(err);
        });

    }

    /**
     * Removes the user from admin in an organization (Does not revoke membership)
     * @param {string} oid
     * @returns {Promise}
     */
    removeAsAdmin(oid){

        // Input validation
        if(oid === undefined){
            return Promise.reject('oid to use is undefined');
        }

        let newOrg = new this.Org({oid:oid});
        return newOrg.get().then(()=>{

            // Process in Org class
            return newOrg.removeAdmin(this.uid);

        }).catch(err => {
            return Promise.reject(err);
        });

    }

    /**
     * Changes user information
     * @param {object=} userData - An object containing data to create the user with
     * @param {string=} userData.fName - The user's First Name
     * @param {string=} userData.lName - The user's Last Name
     * @returns {Promise}
     */
    changeName(userData){

        // Add Changes
        if(userData.fName !== undefined){
            this.fName = userData.fName;
        }
        if(userData.lName !== undefined){
            this.lName = userData.lName;
        }

        // If no fName or lName
        if(userData.fName === undefined && userData.lName === undefined){
            return Promise.reject('No valid information for update.');
        }

        // Update dName
        this.dName = this.fName + ' ' + this.lName;

        // Update DB
        return this.push();
    }


    createDonorEntry(){
        // Send data to blockchain
        return this.utils.blockchainRequest('post','/donor/new',{
            type:'user',
            fname:this.fName,
            lname:this.lName,
            email:this.email,
            wallet_id: this.uid
        }).then(donorID => {
            // Update DB w/ donor ID
            this.donorID = donorID;
            return this.push();
        }).catch(err => {
            return Promise.reject(err);
        });
    }
}

module.exports = User;