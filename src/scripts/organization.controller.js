const Cloudant = require('@cloudant/cloudant');
const cloudant = Cloudant({
    account:"ServiceId-3433c9c5-2f5e-46a5-8a60-f899ff657dac",
    key:"froldedsteatchadedintarn",
    password:"db24ed72b829a14c9b79c4847cb566d2f6e1e422",
    url:"https://a2777322-7e2f-4f00-88ff-5544d827c57f-bluemix.cloudant.com"
});
const orgDB = cloudant.db.use('organizations');
const uuidv4 = require('uuid/v4');
const Org = require('./classes/Org');
const utils = require('./utils');
const User = require('./classes/User');

const render = {
    /**
     * Renders the page of an organization
     * @param {object} req
     * @param {object} res
     * @param {string} orgID
     */
    organization(req,res,orgID) {

        // Get data
        let org = new Org();
        org.get(orgID).then(()=>{

            // Render Page
            utils.render(req, res, {
                template:"organization",
                data: org
            });

        }).catch(err=>{
            res.send(err);
        });
    },
    /**
     * Renders the form used to create an organization
     * @param {object} req
     * @param {object} res
     */
    creationForm(req,res){
        utils.render(req,res,{template:'organizationNew'});
    }
};

/**
 * List organizations
 * @param {string=} resultType - 'length', 'ids', 'idName' {ID:Name,ID2:Name2}, or (blank/other) - all data
 * @returns {Promise}
 */
function listOrgs(resultType){
    return orgDB.list().then(orgList =>{

        console.log(orgList);   // For testing

        switch (resultType){
            case 'length':
                return Promise.resolve(orgList.total_rows);
            case 'ids':

                let idArray = [];   // For return values
                orgList.rows.forEach(row => {
                    idArray.push(row.id);
                });

                return Promise.resolve(idArray);
            case 'idName':

                let idNameObj = {}; // For return values
                let i = orgList.total_rows;

                return new Promise((resolve,reject)=>{
                    orgList.rows.forEach(row => {

                        orgDB.get(row.id).then(orgData => {
                            idNameObj[row.id] = orgData.name;
                            i--;
                            if(i === 0){
                                resolve(idNameObj);
                            }
                        }).catch(err => {
                            reject(err);
                        });
                    });
                });

            default:

                let returnArray = []; // For return values
                let totalRows = orgList.total_rows;

                return new Promise((resolve,reject)=>{
                    orgList.rows.forEach(row => {

                        orgDB.get(row.id).then(orgData => {
                            returnArray.push(orgData);
                            totalRows--;
                            if(totalRows === 0){
                                resolve(returnArray);
                            }
                        }).catch(err => {
                            reject(err);
                        });
                    });
                });
        }


    }).catch(err => {
        return Promise.reject(err);
    })
}

/**
 * Creates a new organization
 * @param req
 * @param res
 */
function newOrg(req,res) {

    let orgData = {
        oid: uuidv4(),
        name: req.body.orgName,
        createdBy: req.session.userData.uid,
        admins: [req.session.userData.uid],
        members: [req.session.userData.uid]
    };

    let newOrg = new Org(orgData);
    newOrg.push().then(()=>{

        let creator = new User({uid:req.session.userData.uid});
        return creator.get();

    }).then(creator=>{

        creator.org.push(orgData.oid);
        return creator.push();

    }).then(()=>{

        res.redirect('/organization/' + orgData.oid);

    }).catch(err => {
        res.send(err);
    });
}

const member = {
    add(oid,uid){

        let org = new Org({oid:oid});
        return org.get().then(()=>{
            return org.addMember(uid);
        }).catch(err => {
            return Promise.reject(err);
        });

    },
    remove(oid,uid){

        let org = new Org({oid:oid});
        return org.get().then(()=>{
            return org.removeMember(uid);
        }).catch(err => {
            return Promise.reject(err);
        });

    }
};

const admin = {
    add(oid,uid){

        let org = new Org({oid:oid});
        return org.get().then(()=>{
            return org.addAdmin(uid);
        }).catch(err => {
            return Promise.reject(err);
        });

    },
    remove(oid,uid){

        let org = new Org({oid:oid});
        return org.get().then(()=>{
            return org.removeAdmin(uid);
        }).catch(err => {
            return Promise.reject(err);
        });

    }
};


function deleteOrg(oid) {

    let org = new Org({oid:oid});
    return org.get().then(()=>{
        return org.delete().then(()=>{
            return Promise.resolve('Success');
        }).catch(err => {
            return Promise.reject(err);
        });
    }).catch(err => {
        return Promise.reject(err);
    });
}


module.exports = {
    render,
    newOrg,
    listOrgs,
    member,
    admin,
    deleteOrg
};