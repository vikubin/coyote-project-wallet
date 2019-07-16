class User{
    constructor (uid){
        this.uid = uid;
        this.fName = null;
        this.lName = null;
        this.dName = null;
        this.email = null;
        this.org = null;
    }

    populate(){

        // TODO: Connect with DB

        // TestData for now
        this.fName = 'Test';
        this.lName = 'User';
        this.dName = 'Test User';
        this.email = 'test.user@email.com';
        this.org = 'TestOrganization';

        return Promise.resolve(this);
    }
}

function loginUser(req,res){

    function fakeVerification(email,pass) {
        if(email === 'test.user@email.com' && pass === 'testtest'){
            return Promise.resolve('fakeuid');
        }else{
            return Promise.reject('Bad Password');
        }
    }

    return fakeVerification(req.body.email, req.body.pass).then(uid=>{
        let newUser = new User(uid);
        return newUser.populate().then(userData => {
            return Promise.resolve(userData);
        });
    }).catch(err => {
        console.error(err);
        return Promise.reject(err);
    });
}

function register(req,res) {

}

module.exports = {
    loginUser,
    register
};