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
    }

    /**
     * Fills Organization data from DB
     * @param {string=} oid
     * @returns {Promise<this>}
     */
    get(oid){
        // Allow a oid to be passed w/ get method
        if (oid !== undefined){
            this.uid = oid;
        }

        return orgDB.get(this.uid).then(data => {

            this.oid = data.oid;
            this.name = data.name;
            this.createdBy = data.createdBy;
            this.admins = data.admins;
            this.members = data.members;

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

    addMember(){

    }

    addAdmin(){

    }
}

module.exports = Org;