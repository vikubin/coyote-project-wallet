const Cloudant = require('@cloudant/cloudant');
const cloudant = Cloudant({
    account:"ServiceId-3433c9c5-2f5e-46a5-8a60-f899ff657dac",
    key:"froldedsteatchadedintarn",
    password:"db24ed72b829a14c9b79c4847cb566d2f6e1e422",
    url:"https://a2777322-7e2f-4f00-88ff-5544d827c57f-bluemix.cloudant.com"
});
const orgDB = cloudant.db.use('organizations');

/**
 * A class that represents an Organization
 */
class Org{
    /**
     * Create an Organization
     * @param {object=} orgData
     * @param {string=} orgData.oid
     * @param {string=} orgData.name
     * @param {string=} orgData.createdBy
     * @param {array=}  orgData.admins
     * @param {array=}  orgData.members
     */
    constructor (orgData = {}){
        this.oid = orgData.oid;
        this.name = orgData.name;
        this.createdBy = orgData.createdBy;
        this.admins = orgData.admins;       // Array of UIDs
        this.members = orgData.members;     // Array of UIDs

        this.User = require('./User');
    }

    /**
     * Fills Organization data from DB
     * @param {string=} oid
     * @returns {Promise<this>}
     */
    get(oid){
        // Allow a oid to be passed w/ get method
        if (oid !== undefined){
            this.oid = oid;
        }

        return orgDB.get(this.oid).then(data => {

            this.oid = data.oid;
            this.name = data.name;
            this.createdBy = data.createdBy;
            this.admins = data.admins;
            this.members = data.members;
            this._id = data._id;
            this._rev = data._rev;

            return Promise.resolve(this);
        }).catch(err => {
            return Promise.reject(err);
        });
    }

    /**
     * Pushes Organization data to DB
     * @returns {Promise}
     */
    push(){
        // Ensure all values are filled
        if(this.oid === undefined){
            return Promise.reject('oid is undefined. Cannot push to DB.');
        }
        if(this.name === undefined){
            return Promise.reject('name is undefined. Cannot push to DB.');
        }
        if(this.createdBy === undefined){
            return Promise.reject('createdBy is undefined. Cannot push to DB.');
        }
        if(this.admins === undefined){
            return Promise.reject('admins is undefined. Cannot push to DB.');
        }
        if(this.members === undefined){
            return Promise.reject('members is undefined. Cannot push to DB.');
        }


        // Object to send to DB
        const orgData = {
            oid: this.oid,
            name: this.name,
            createdBy: this.createdBy,
            admins: this.admins,
            members: this.members
        };

        // Send to DB
        return orgDB.insert(orgData, this.oid).then(() => {
            return Promise.resolve();
        }).catch((err) => {
            return Promise.reject(err);
        });
    }

    /**
     * Adds a User to the organization
     * @param {string} uid
     * @returns {Promise}
     */
    addMember(uid){

        // Input validation
        if(uid === undefined){
            return Promise.reject('uid to add is undefined');
        }

        // Check if user is a member
        if(this.members.includes(uid)){
            return Promise.resolve('User is already a member.');
        }

        // Get member information
        let newMember = new this.User({uid:uid});
        return newMember.get().then(()=>{

            // Add uid to Org's members list
            this.members.push(uid);
            // Update DB
            return this.push();

        }).then(()=>{

            // Add oid to User's org list
            return newMember.makeMember(this.oid)

        }).catch(err => {
            return Promise.reject(err);
        });
    }

    /**
     * Removes a User from the organization
     * @param {string} uid
     * @returns {Promise}
     */
    removeMember(uid){
        console.log('starting removemember with uid: ' + uid);

        // Input validation
        if(uid === undefined){
            return Promise.reject('uid to remove is undefined');
        }

        // Check if user is a member
        if(this.members.indexOf(uid) === -1){
            return Promise.resolve('User is not a member.');
        }

        console.log(this.User);

        // Get member information
        let memberToRemove = new this.User({uid:uid});
        return memberToRemove.get().then(()=>{

            // Remove uid from Org's members list
            this.members.splice(this.members.indexOf(uid));
            // Update DB
            return this.push();

        }).then(()=>{

            // Remove oid from User's org list
            return memberToRemove.removeAsMember(this.oid);

        }).catch(err => {
            return Promise.reject(err);
        });
    }

    /**
     * Adds a User as an admin to the organization
     * @param {string} uid
     * @returns {Promise}
     */
    addAdmin(uid){

        // Input validation
        if(uid === undefined){
            return Promise.reject('uid to add is undefined');
        }

        // Make user a member if not already
        this.addMember(uid).then(()=>{

            // Add uid to Org's members list
            this.admins.push(uid);
            // Update DB
            return this.push();

        }).catch(err => {
            return Promise.reject(err);
        });
    }

    /**
     * Removes user from admin in an organization (Does not revoke membership)
     * @param {string} uid
     * @returns {Promise}
     */
    removeAdmin(uid){

        // Input validation
        if(uid === undefined){
            return Promise.reject('uid to remove is undefined');
        }

        // Remove uid from Org's admins list
        this.admins.splice(this.admins.indexOf(uid));
        // Update DB
        return this.push();
    }

    /**
     * Rename the Organization
     * @param {string} newName
     * @returns {Promise}
     */
    changeName(newName){

        // Validate input
        if(typeof newName === 'string' && newName !== undefined){
            return Promise.reject('New name ' + newName + ' not valid.');
        }

        // Update org name
        this.name = newName;

        // Update DB
        return this.push();
    }

    /**
     * Check if a uid is an admin of the Org
     * @param {string} uid - User ID to check
     * @returns {boolean} - True if admin; False otherwise
     */
    isAdmin(uid){
        return (this.admins.includes(uid));
    }

    /**
     * Check if a uid is an member of the Org
     * @param {string} uid - User ID to check
     * @returns {boolean} - True if member; False member
     */
    isMember(uid){
        return (this.members.includes(uid));
    }

    delete(){

        // Remove all users
        let userDeletion = new Promise((resolve,reject) => {

            // Get the amount of members to delete
            let memberAmt = this.members.length;

            // Remove each member
            this.members.forEach(member => {
                console.log('Removing ' + member + ' as a member.');

                // Create a User for each member
                let memberDel = new this.User({uid:member});
                // Load the User
                memberDel.get().then(()=>{

                    // Delete org manually to avoid revision conflicts
                    memberDel.org.splice(memberDel.org.indexOf(this.oid));
                    return memberDel.push();
                }).then(()=>{

                    // Decrement member count
                    memberAmt--;

                    // If last member, resolve
                    if(memberAmt === 0){
                        resolve('All Members Deleted');
                    }
                }).catch(err => {
                    reject(err);
                })
            });
        });

        // Delete from DB
        return Promise.all([
            userDeletion
        ]).then(status=>{
            console.log(status);

            // Delete org from DB
            return orgDB.destroy(this.oid, this._rev);

        }).catch(err=>{
            console.error(err);
            return Promise.reject(err);
        })

    }
}

module.exports = Org;