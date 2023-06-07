const express = require('express');
const { default: Surreal } = require('surrealdb.js');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = new Surreal('http://127.0.0.1:8000/rpc');

//CURL: curl http://localhost:3001/notes
// This is the output of curl command: [{"content":"test","id":"note:p6rht9dfrkrfi78n11k3","title":"test"}]
app.get('/notes', async (req, res) => {
    await db.signin({
        user: 'root',
        pass: 'root',
    });
    await db.use('test', 'test');

    let notes = await db.select("note");
    console.log(notes);

    res.json(notes);
});

//CURL: curl -X POST -H "Content-Type: application/json" -d '{"title":"test","content":"test"}' http://localhost:3001/notes
// This is the output of curl command: [{"content":"test","id":"note:p6rht9dfrkrfi78n11k3","title":"test"}]
app.post('/notes', async (req, res) => {
    const note = req.body;

    await db.signin({
        user: 'root',
        pass: 'root',
    });
    await db.use('test', 'test');

    let created = await db.create("note", note);
    
    // Return only the new note object. Assume the newly created note is at the end of the 'created' array
    let newNote = created[created.length - 1];
    
    res.json(newNote);
});

app.listen(3001, () => {
    console.log('Listening on port 3001');
});

//CURL: curl -X DELETE http://localhost:3001/notes/note:p6rht9dfrkrfi78n11k3
app.delete('/api/notes/:id', async (req, res) => {
    try {
        const id = req.params.id;
        console.log(id);

        // Authenticate as an admin user or the user who owns the note
        await db.signin({
            user: 'root', // Or the username of the user who owns the note
            pass: 'root' // Or the password of the user who owns the note
        });

        await db.use('test', 'test'); 

        // No need to add 'note:' prefix as 'id' already contains it
        await db.delete(id);

        // Select the note with the given id
        const note = await db.select(id);

        // If the note is not found, it was successfully deleted
        if (!note) {
            console.log(`Note with id: ${id} deleted successfully`);
            res.status(200).send({message: "Note deleted successfully"});
        } else {
            console.log(`Failed to delete note with id: ${id}`);
            res.status(400).send({message: "Failed to delete note"});
        }
    } catch (error) {
        console.error('Failed to delete note:', error);
        res.status(500).send({error: error.message});
    }
});


// Update a note
//CURL: curl -X PUT -H "Content-Type: application/json" -d '{"title":"New Title","content":"New Content"}'
// http://localhost:3001/api/notes/note:9dww0371ax2ojwofjh27
app.put('/api/notes/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const updatedNote = req.body;
  
      await db.signin({
        user: 'root',
        pass: 'root',
      });
  
      await db.use('test', 'test');
  
      let note = await db.update(id, updatedNote);
  
      if (note) {
        console.log(`Note with id: ${id} updated successfully`);
        res.status(200).send(note);
      } else {
        console.log(`Failed to update note with id: ${id}`);
        res.status(400).send({ message: "Failed to update note" });
      }
    } catch (error) {
      console.error('Failed to update note:', error);
      res.status(500).send({ error: error.message });
    }
  });
  

  
