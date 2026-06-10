const axios = require('axios');
async function test() {
  try {
    const res = await axios.get('http://192.168.1.58:5000/api/v1/products', {
      params: {
        categoryId: '478a6459-7a70-43a0-a65e-e48bbe4632a4',
        sortBy: 'popularity',
        limit: 20,
        offset: 0
      }
    });
    console.log(res.data);
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
}
test();
