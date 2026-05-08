const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://hrcodeenvision_db_user:pEosUniclENitzOO@alusamadb.xbcomx0.mongodb.net/?retryWrites=true&w=majority&appName=alUsamaDB";

async function run() {
    const client = new MongoClient(uri, { tlsAllowInvalidCertificates: true });
    try {
        console.log("Attempting to connect to MongoDB...");
        await client.connect();
        console.log("Connected successfully to server");
        const db = client.db("alUsamaDB");
        const collections = await db.listCollections().toArray();
        console.log("Collections:", collections.map(c => c.name));
    } catch (err) {
        console.error("Connection failed:", err);
    } finally {
        await client.close();
    }
}
run();
