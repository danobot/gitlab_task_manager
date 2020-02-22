import {checkStatus, parseJSON, getClient}  from './common';


function findAll(cb) {
    getClient().then(c => {
        c.getAccounts().then(checkStatus)
        .then(parseJSON).then(cb)   
    })
//     return fetch('/accounts', {
//       accept: 'application/json',
//     }).then(checkStatus)
//       .then(parseJSON)
//       .then(cb);
}




const Account = { findAll };
export default Account;