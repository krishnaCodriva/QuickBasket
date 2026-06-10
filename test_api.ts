import { productApi } from './src/services/productApi';
async function test() {
  const data = await productApi.getProducts({ limit: 10 });
  console.log(JSON.stringify(data, null, 2));
}
test().catch(console.error);
