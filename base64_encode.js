const username = "485f5988-a678-4c26-baf9-fc50fe0c496b";
const password = "3c47a7e75e38487ea3dd1a76157b9c06";

// Encode credentials in Base64
const encodedCredentials = btoa(`${username}:${password}`);

console.log(`Basic ${encodedCredentials}`);
