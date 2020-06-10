const express = require('express');
const bodyparser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors =  require('cors');
const knex =  require('knex');
 
const db = knex({
	client: 'pg',
  version: '7.2',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : '7000353872',
    database : 'smart-brain'
}
});

const app = express();
app.use(bodyparser.json());
app.use(cors())

app.get('/',(req,res) => {
	res.send('its working bruh');
})
app.post('/SignIn',(req,res) => {
	db.select('email','hash').from('login')
	.where('email', '=',req.body.email)
	.then(data => {
		const isValid =bcrypt.compareSync(req.body.password,data[0].hash);
		console.log(isValid);
		if(isValid){
			return db.select('*').from('users')
			.where('email','=',req.body.email)
			.then(user =>{
				console.log(user);
				res.json(user[0])
			})
			.catch(err => res.status(400).json('unable to connect'))
		}else{
			res.status(400).json('something is wrong')
		}

	})
	.catch(err => res.status(400).json('wrong credentials'))
})


app.post('/register',(req,res) => {
	 const {email,password,name} = req.body;
	 const hash= bcrypt.hashSync(password);
      db.transaction(trx => {
      	trx.insert({
      		hash:hash,
      		email:email
      	})
      	.into('login')
      	.returning('email')
      	.then(loginEmail =>{
      		return trx('users')
	.returning('*')
	.insert({
		email:loginEmail[0],
		name:name,
		joined:new Date()
	})
	.then(user =>{
		res.json(user[0]);

      	})
      })
      	.then(trx.commit)
      	.catch(trx.rollback)
	})
	 .catch(err =>status(400).json('unable to register'))
	
})
app.get('/profile/:id',(req,res) => {
	const { id } = req.params;
	
	db.select('*').from('users').where({id})
	.then(user =>{
		if(user.length){
			res.json(user[0])
		}else{
			res.status(400).json('Not Found')
		}
		
	})
		.catch(err => res.status(400).json('error getting user')) 
	
})




app.put("/image", (req,res) => {
	const { id } = req.body;
	db('users').where('id','=',id)
	.increment('entries',1)
	.returning('entries')
	.then(entries => {
		res.json(entries[0]);
	})		
.catch(err => res.status(400).json('Not Found Any Entries'))
})

app.listen(process.env.PORT || 3000,() =>{

	console.log(`app is working on port ${process.env.PORT}`);
})