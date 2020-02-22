import OpenAPIClientAxios from 'openapi-client-axios';

export function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
        return response;
    }
    const error = new Error(`HTTP Error ${response.statusText}`);
    error.status = response.statusText;
    error.response = response;
    console.log(error); // eslint-disable-line no-console
    throw error;
}

export function parseJSON(response) {
    return response.data;
}


const api = new OpenAPIClientAxios({ definition: 'http://localhost:3000/openapi.json' });
api.init()

// async function createTodo() {
//   const client = await api.getClient();
//   console.log(client)
//   const res = await client.getAccounts();
//   console.log('Accounts queried: ', res.data);
// }

 export async function getClient() {
     return await api.getClient();
 }