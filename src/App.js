
import React, { Component } from 'react';
import Profile from './Profile.js';
import Signin from './Signin.js';
import {
  UserSession,
  AppConfig
} from 'blockstack';

const appConfig = new AppConfig()
const userSession = new UserSession({ appConfig: appConfig })

//new code:testing on reference input form from input form js
const blockstack = require('blockstack')

var contentFromloadFileForNewFileSave;
var previousContentRowCount;

//version 1.0.0.0

export default class App extends Component {

  constructor(props) {

    previousContentRowCount = 0;

    super(props);

    this.state = {
      content: '',
    };

    //this binding syntax is for profile js to access
    this.onTextChange = this.onTextChange.bind(this);
    this.saveNewFile = this.saveNewFile.bind(this);
    //this.saveNewFile_getContent = this.saveNewFile_getContent.bind(this);
    this.loadFile = this.loadFile.bind(this);
  } 

  onTextChange(event) {
    this.setState({
      content: event.target.value,
    });
  }

  handleSignIn(e) {
    e.preventDefault();
    userSession.redirectToSignIn();
  }

  handleSignOut(e) {
    e.preventDefault();
    userSession.signUserOut(window.location.origin);
  }

  saveNewFile() {
    
    //step 1: load the previous content data
    this.loadFileForNewFileSave();

    var noteContent;

    if (this.state.content) {

      //step 2: append the new note to the content
      var dateTime = new Date();
      var dateTimeStr = dateTime.toUTCString();
      //alert('saveNewFile' +dateTimeStr );

      //when button click, it called and working good, so, now, just a direct call
      //loadFileForNewFileSave();
      //initialize content from previous save
      noteContent = contentFromloadFileForNewFileSave;
      //blockstack.putFile("/hello.txt", "|" + dateTimeStr + "!" + this.state.content , true)      
      noteContent = noteContent + "||" + dateTimeStr + "|" + this.state.content;
      //alert('saveNewFile:noteContent before save:' +noteContent );
      blockstack.putFile("/encryptedNotes.txt", noteContent , true)      

      //blockstack.putFile("/hello.txt", "testing verbiage from input box", true)
      .then(() => {
        // /hello.txt exists now, and has the contents "hello world!".
        alert('Done! Note is saved');
        //document.getElementById("demo").innerHTML = "Done! Created hello.txt";
      }).catch((e) => {
        //console.log('e');
        //console.log(e);
        alert(e.message);
      });
    } else {
      alert('Textbox cannot be blank.');
    }
  }

  loadFile() {

    //window.location.reload();

    blockstack.getFile("/encryptedNotes.txt", true)
    .then((fileContents) => {
      //alert('Loaded hello.txt\n' + fileContents );
      //document.getElementById("demo").innerHTML = "Loaded hello.txt\n" + fileContents;
      contentFromloadFileForNewFileSave = fileContents;
      //parse the content string and display 
      //var array = entry.split("");

      //insert the content to the table
      var contentArray = contentFromloadFileForNewFileSave.split("||");
      var currentContentRowCount = 0;
      var i;
      for (i=0;i<contentArray.length;i++)
      {
        document.getElementById("NotesTable").style.color = "green";
        var table = document.getElementById("NotesTable");
        
        var row = table.insertRow(0);

        //split the timestamp column from verbiage column
        var columnArray = contentArray[i].split("|");
        var j;

        if (columnArray.length === 2 )
        {
          currentContentRowCount ++;
          if (currentContentRowCount > previousContentRowCount)
          {
            //adding one row
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);
            var cell3 = row.insertCell(2);

            for (j=0;j<columnArray.length;j++)
            {
              //alert('loadFileForNewFileSave:columnArray:j=' + j + ':columnArray = ' + columnArray[j] );    
              if (j === 0)            
                cell1.innerHTML = columnArray[0];            
              
              if (j === 1)
                cell3.innerHTML = columnArray[1];                        
            }
            cell2.innerHTML = "     ";                        
          }
          //alert('loadFileForNewFileSave:columnArray:finish row:i=' + i );    
        }
      }

      previousContentRowCount = currentContentRowCount;

    }).catch((e) => {
      console.log('e');
      console.log(e);
      alert(e.message);
    });
  }

  loadFileForNewFileSave() {    

    blockstack.getFile("/encryptedNotes.txt", true)
    .then((fileContents) => {
      //alert('Loaded hello.txt\n' + fileContents );
      //document.getElementById("demo").innerHTML = "Loaded hello.txt\n" + fileContents;
      contentFromloadFileForNewFileSave = fileContents;
    }).catch((e) => {
      alert(e.message);
    });
  }
  
  render() {

    if (userSession.isUserSignedIn() === true)
    {
          return (
          

            <div className="site-wrapper">
              <div className="site-wrapper-inner">
                { !userSession.isUserSignedIn() ?
                  <Signin userSession={userSession} handleSignIn={ this.handleSignIn } />
                  : <Profile userSession={userSession} handleSignOut={ this.handleSignOut } />
                }

              <br></br>  

              <div id="noteDivSection">  

              <br/><br/>
                <button onClick={this.loadFile}>Load Existing Notes</button>
              
              <br/><br/> 
              <br/><br/>
                <input
                  type="text"
                  onChange={this.onTextChange}
                  value={this.state.content}
                  cols="150" 
                  rows="10"
                />

              <br></br>        
                <button onClick={this.saveNewFile} >Save New Note</button>
              
              

                <br/><br/>

                <p id="demo"></p>

                <br/><br/>

                <table id="NotesTable" align="center">
                
                  
                </table> 

                <p id="noteContent"></p>

              </div>     

            </div>
          </div>      
          );
        }
        else
        {
          return (          

            <div className="site-wrapper">
              <div className="site-wrapper-inner">
                { !userSession.isUserSignedIn() ?
                  <Signin userSession={userSession} handleSignIn={ this.handleSignIn } />
                  : <Profile userSession={userSession} handleSignOut={ this.handleSignOut } />
                }
              </div>
            </div>      
          );

        }
  }

  componentDidMount() {
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData) => {
        window.history.replaceState({}, document.title, "/")
        this.setState({ userData: userData})
      });
    }
  }
}
