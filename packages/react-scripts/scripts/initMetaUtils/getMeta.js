
const fetch = require("cross-fetch");
const {ask} = require("./common")

const formatEndpoint = (endpoint)=>endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;

const fetchToken = (endpoint, login, password) =>
  new Promise((resolve, reject) => {
    fetch(endpoint + "/authorization/api/v1.0/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password })
    })
      .then(res => res.json())
      .then(({ data }) => {
        if (data.error) return reject(data.error);
        resolve(data.token);
      })
      .catch(err => reject(err));
  });

const fetchMeta = (endpoint, token) =>
  new Promise((resolve, reject) => {
    fetch(endpoint + "/custodian/meta", {
      headers: { Authorization: `Token ${token}` }
    })
      .then(res => res.json())
      .then(({data}) => resolve(data))
      .catch(err => reject(err));
  });

async function getMeta(url = "") {
  const endpoint = formatEndpoint((await ask('Enter host' + url?` (${url})`: '')) || url);
  const login = await ask("Login");
  const password = login ? await ask("Password", true) : "";
  const token = await fetchToken(endpoint, login, password);
  const meta = await fetchMeta(endpoint, token);
  return meta;
}

module.exports = getMeta;
