const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://hrcodeenvision_db_user:pEosUniclENitzOO@alusamadb.xbcomx0.mongodb.net/?appName=alUsamaDB";

async function run() {
    const client = new MongoClient(uri);
    try {
        console.log("Attempting to connect to MongoDB with user-provided string...");
        await client.connect();
        console.log("Connected successfully!");
        const db = client.db("alUsamaDB");
        const users = await db.collection("User").find({}).toArray();
        console.log("Users in DB:", users.length);
        if (users.length > 0) {
            console.log("First user email:", users[0].email);
        }
    } catch (err) {
        console.error("Connection failed:", err);
    } finally {
        await client.close();
    }
}
run();
