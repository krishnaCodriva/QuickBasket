const axios = require('axios');
async function test() {
  try {
    const res = await axios.get('http://192.168.1.58:5000/api/v1/products', {
      params: {
        search: 'Milk'
      }
    });
    console.log(res.data);
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
}
test();
