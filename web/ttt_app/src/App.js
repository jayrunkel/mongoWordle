// -*- mode: js-jsx;-*-

import {useState, useEffect } from 'react';
//import ReactDOM from 'react-dom';
//import * as Realm from 'realm';
import * as Realm from "realm-web";
import './index.css';
const wordle = require('./Wordle');

const REALM_APP_ID = "wordleservice-lxqoh";
const app = new Realm.App({ id: REALM_APP_ID });

//<link rel="icon" href="/assets/images/global/favicon.ico" type="image/x-icon">

// Create a component that displays the given user's details
function UserDetail({ user }) {
  return (
    <div>
      <b>Ready</b>
    </div>
  );
}

// Create a component that lets an anonymous user log in
function Login({ setUser }) {
  const loginAnonymous = async () => {
    const user = await app.logIn(Realm.Credentials.anonymous());
    setUser(user);
  };
  return <button onClick={loginAnonymous}>Log In</button>;
}



// ========================================

/*
ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
*/

function App() {
	// Keep the logged in Realm user in local state. This lets the app re-render
  // whenever the current user changes (e.g. logs in or logs out).
  const [user, setUser] = useState(app.currentUser);

	useEffect(() => {

		async function login() {
			const user = await app.logIn(Realm.Credentials.anonymous());
			setUser(user);
		}
		
		if (!user) {
			login();
		}

	}, [])

  // If a user is logged in, show their details.
  // Otherwise, show the login screen.
  return (
      <div className="App">
      <div className="App-header">
				<h1>Hack Wordle</h1>
      </div>
			{user ? <div><wordle.Wordle user={user} /></div> : <div>Authenticating...</div>}
    </div>
  );
}

export default App;

//          {user ? <UserDetail user={user} /> : <Login setUser={setUser} />}

