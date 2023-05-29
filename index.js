const express = require('express');
const { default: Surreal } = require('surrealdb.js');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = new Surreal('http://127.0.0.1:8000/rpc');

app.get('/notes', async (req, res) => {
    await db.signin({
        user: 'root',
        pass: 'root',
    });
    await db.use('test', 'test');

    let notes = await db.select("note");

    res.json(notes);
});

//CURL: curl -X POST -H "Content-Type: application/json" -d '{"title":"test","content":"test"}' http://localhost:3001/notes
app.post('/notes', async (req, res) => {
    const note = req.body;

    await db.signin({
        user: 'root',
        pass: 'root',
    });
    await db.use('test', 'test');

    let created = await db.create("note", note);

    res.json(created);
});

app.listen(3001, () => {
    console.log('Listening on port 3001');
});
