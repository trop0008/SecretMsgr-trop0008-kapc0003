/*****************************************************************
File: index.js
Author: Marjan Tropper & Alison Kapcala 
Description:

Secret Messenger Assignment - iOS Cordova App
The had has:
- a custom launcher icon and splashscreen image
- a single screen for login and register
- a screen for taking a picture with the device camera and then embedding a message in that image and sending it to a selected user's message queue. The user must be logged in to see this screen.
- screen for displaying the downloaded image and message that was embedded. The user must be logged in to access this screen.

Version: 0.1.1
Updated: April 25, 2017


   
*****************************************************************/
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
"use strict";
var app = {
    initialize: function () {
        try { // this is to enable testing in browser
            document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
        }
        catch (e) {
            document.addEventListener('DOMContentLoaded', this.onDeviceReady.bind(this), false);
        }
    }
    , onDeviceReady: function () {
        this.pageChanged();
    }
    , pageChanged: function () {
        let user_name = "";
        let email = "";
        let action = "";
        let user_guid = "";
        let user_id = "";
        let message_id = "";
        let recipient_id="";
        let recipient_name="";
        let msg_id = "";
        //let sender_id = "";
        //let sender_name = "";
        document.getElementById("btnLogin").addEventListener("click", loginRegisterFunc);
        document.getElementById("btnRegister").addEventListener("click", loginRegisterFunc);
        document.getElementById("composeMsg").addEventListener("click", fetchusersFunc);
        document.getElementById("replyMsg").addEventListener("click", replyMsgFunc);
        document.getElementById("TakePicMessage").addEventListener("click", takePicFunc);
        document.getElementById("SendMessageBtn").addEventListener("click", SendMessageFunc);
        document.getElementById("msgDeleteBtn").addEventListener("click", deleteMsgFunc);
        
        
        console.log("we are in business");
        function replyMsgFunc(ev){
            ev.preventDefault;
            
            let select = document.getElementById("recipientList");
                    select.innerHTML = "";
                    document.getElementById("cameraimage").style.display="none";
                    
                        let option = document.createElement("option");
                        option.value = recipient_id;
                        option.innerHTML = recipient_name;
                        select.appendChild(option);
                    
                
                document.getElementById("composeModal").classList.add("active");
                document.getElementById("msgListModal").classList.remove("active");
                document.getElementById("msgDisplayModal").classList.remove("active");
            
        }

        function takePicFunc(ev) {
            ev.preventDefault;
            navigator.camera.getPicture(onSuccess, onFail, {
                quality: 50
                , targetWidth: 300
                , targetHeight: 300
                
                , correctOrientation: true
                , destinationType: Camera.DestinationType.FILE_URI
            });

            function onSuccess(imageURI) {
                let image = document.createElement('img');
                image.src = imageURI;
                let c = document.getElementById("newMsgCanvas");
                let ctx = c.getContext('2d');
                image.crossOrigin = "Anonymous";
                image.addEventListener('load', function (ev) {
                    //image has been loaded
                    var w = image.width;
                    var h = image.height;
                    c.style.width = w + 'px';
                    c.style.height = h + 'px';
                    c.width = w;
                    c.height = h;
                    ctx.drawImage(image, 0, 0);
                    document.getElementById("cameraimage").style.display="block";
                     document.getElementById("TakePicMessage").style.display = "none";
                document.getElementById("SendMessageBtn").style.display = "block";
                });
               
            }
            
            

            function onFail(message) {
                alert('Failed because: ' + message);
            }
        }
        
        
        function SendMessageFunc(){
           let c = document.getElementById("newMsgCanvas");
            let context = c.getContext('2d'); 
            
           recipient_id =document.getElementById("recipientList").value;
               console.log(document.getElementById("recipientList").value);
            console.log(document.getElementById("msgText").value.trim());
            
            let msgText = document.getElementById("msgText").value.trim();
        
        
        
        try {
            
            c = BITS.setUserId( BITS.numberToBitArray( recipient_id ), c );
        
            c = BITS.setMsgLength( BITS.numberToBitArray( msgText.length * 16 ), c );

            c = BITS.setMessage( BITS.stringToBitArray( msgText ), c );
            
        } catch( error ) {
            
            console.log(error);
            
        }
            
            dataURLToBlob( c.toDataURL() )
        .then(function( blob ){
            /***********************************/
                let formData = new FormData();
            formData.append("user_guid", user_guid);
            formData.append("user_id", user_id);
                formData.append("recipient_id", recipient_id);
                formData.append("image", blob);
                action="msg-send.php"
            let url = 'https://griffis.edumedia.ca/mad9022/steg/' + action;
            fetch(url, {
                method: 'post'
                , mode: 'cors'
                , body: formData
            }).then(function (response) {
                console.log(response);
                return response.json();
            }).then(function (jsonData) {
                console.log(jsonData);
               hideModals();
                 document.getElementById("msgText").value="";
                context.clearRect(0,0,c.width,c.height);
                fetchMessegesFunc();
                return jsonData;
            }).catch(function () {
                console.log('unable to fetch');
            });
            
                
                
                
                
                
                
                
                
                
                
                
                /*****************************/
            })       
        
            
           // context.clearRect(0,0,c.width,c.height);
            
        }

        function dataURLToBlob(dataURL) {
            return Promise.resolve().then(function () {
                var type = dataURL.match(/data:([^;]+)/)[1];
                var base64 = dataURL.replace(/^[^,]+,/, '');
                var buff = binaryStringToArrayBuffer(atob(base64));
                return new Blob([buff], {
                    type: type
                });
            });
        }

        function binaryStringToArrayBuffer(binary) {
            var length = binary.length;
            var buf = new ArrayBuffer(length);
            var arr = new Uint8Array(buf);
            var i = -1;
            while (++i < length) {
                arr[i] = binary.charCodeAt(i);
            }
            return buf;
        }

        function loginRegisterFunc(ev) {
            ev.preventDefault;
            email = document.getElementById("email").value;
            console.log(email);
            user_name = document.getElementById("user_name").value;
            switch (ev.currentTarget.id) {
            case 'btnLogin':
                action = "login.php";
                break;
            case 'btnRegister':
                action = "register.php";
                break;
            default:
            }
            fetchuserFunc();
        }

        function fetchuserFunc() {
            console.log(user_name);
            let formData = new FormData();
            formData.append("user_name", user_name);
            formData.append("email", email);
            let url = 'https://griffis.edumedia.ca/mad9022/steg/' + action;
            fetch(url, {
                method: 'post'
                , mode: 'cors'
                , body: formData
            }).then(function (response) {
                console.log(response);
                return response.json();
            }).then(function (jsonData) {
                console.log(jsonData);
                user_guid = jsonData.user_guid;
                user_id = jsonData.user_id;
                console.log(user_guid);
                console.log(user_id);
                fetchMessegesFunc();
                return jsonData;
            }).catch(function () {
                console.log('unable to fetch');
            });
        }

        function fetchMessegesFunc() {
            let formData = new FormData();
            formData.append("user_guid", user_guid);
            formData.append("user_id", user_id);
            action = "msg-list.php";
            let url = 'https://griffis.edumedia.ca/mad9022/steg/' + action;
            fetch(url, {
                method: 'post'
                , mode: 'cors'
                , body: formData
            }).then(function (response) {
                console.log(response);
                return response.json();
            }).then(function (jsonData) {
                console.log(jsonData);
                messageListFunc(jsonData);
                document.getElementById("msgListModal").classList.add("active");
                
                return jsonData;
            }).catch(function (err) {
                console.log("Error: " + err.message);
            });
        }
        function hideModals(){
            document.getElementById("cameraimage").style.display="none";
                     document.getElementById("TakePicMessage").style.display = "block";
                document.getElementById("SendMessageBtn").style.display = "none";
            document.getElementById("composeModal").classList.remove("active");
                document.getElementById("msgListModal").classList.remove("active");
                document.getElementById("msgDisplayModal").classList.remove("active");
            
            
        }

        function fetchusersFunc() {
            let formData = new FormData();
            formData.append("user_guid", user_guid);
            formData.append("user_id", user_id);
            action = "user-list.php";
            let url = 'https://griffis.edumedia.ca/mad9022/steg/' + action;
            fetch(url, {
                method: 'post'
                , mode: 'cors'
                , body: formData
            }).then(function (response) {
                console.log(response);
                return response.json();
            }).then(function (jsonData) {
                console.log(jsonData);
                if (jsonData.code == 0) {
                    console.log(jsonData.users);
                    let select = document.getElementById("recipientList");
                    select.innerHTML = "";
                    document.getElementById("cameraimage").style.display="none";
                    jsonData.users.forEach(function (user, index) {
                        let option = document.createElement("option");
                        option.value = user.user_id;
                        option.innerHTML = user.user_name;
                        select.appendChild(option);
                    });
                }
                
                document.getElementById("composeModal").classList.add("active");
                document.getElementById("msgListModal").classList.remove("active");
                document.getElementById("msgDisplayModal").classList.remove("active");
                return jsonData;
            }).catch(function (err) {
                console.log("Error: " + err.message);
            });
        }

        function deleteMsgFunc() {
            let formData = new FormData();
            formData.append("user_guid", user_guid);
            formData.append("user_id", user_id);
            formData.append("message_id", message_id);
            action = "msg-delete.php";
            let url = 'https://griffis.edumedia.ca/mad9022/steg/' + action;
            fetch(url, {
                method: 'post'
                , mode: 'cors'
                , body: formData
            }).then(function (response) {
                console.log(response);
                return response.json();
            }).then(function (jsonData) {
                console.log(jsonData);
                message_id="";
                document.getElementById("msgDisplayModal").classList.remove("active");
                
                fetchMessegesFunc();
                return jsonData;
            }).catch(function (err) {
                console.log("Error: " + err.message);
            });
        }

        function fetchMsgFunc() {
            let formData = new FormData();
            formData.append("user_guid", user_guid);
            formData.append("user_id", user_id);
            formData.append("message_id", message_id);
            action = "msg-get.php";
            let url = 'https://griffis.edumedia.ca/mad9022/steg/' + action;
            fetch(url, {
                method: 'post'
                , mode: 'cors'
                , body: formData
            }).then(function (response) {
                console.log(response);
                return response.json();
            }).then(function (jsonData) {
                console.log(jsonData);
                showMessage(jsonData);
                return jsonData;
            }).catch(function (err) {
                console.log("Error: " + err.message);
            });
        }

        function showMessage(msgData) {
            let img = document.getElementById("msgImage");
            var c = document.getElementById("msgCanvas");
            var ctx = c.getContext('2d');
            var img1 = document.createElement('img');
            img1.crossOrigin = "Anonymous";
            img1.src = 'https://griffis.edumedia.ca/mad9022/steg/' + msgData.image;
            img1.addEventListener('load', function (ev) {
                //image has been loaded
                var w = img1.width;
                var h = img1.height;
                c.style.width = w + 'px';
                c.style.height = h + 'px';
                c.width = w;
                c.height = h;
                ctx.drawImage(img1, 0, 0);
                document.getElementById("messageContent").innerHTML = BITS.getMessage(msgData.recipient, c);
            });
        }

        function messageListFunc(msgList) {
            console.log(msgList.messages.length);
            if (msgList.messages) {
                if (msgList.messages.length > 0) {
                    console.log(msgList.messages.length);
                    console.log(msgList.messages);
                    let ul = document.getElementById('msgListUl');
                    ul.innerHTML = "";
                    msgList.messages.forEach(function (messageItem, index) {
                        // the saved list items are created here
                        let li = document.createElement("li");
                        li.className = "table-view-cell ";
                        let a = document.createElement("a");
                        a.className = "navigate-right";
                        a.innerHTML = "Message from " + messageItem.user_name;
                        li.appendChild(a);
                        ul.appendChild(li);
                        a.addEventListener("click", viewMessage);

                        function viewMessage(ev) {
                            ev.preventDefault;
                            console.log(messageItem.msg_id);
                            console.log(messageItem.sender_id);
                            console.log(messageItem.user_name);
                            message_id = messageItem.msg_id;
                            recipient_id=messageItem.sender_id;
                            recipient_name=messageItem.user_name;
                            document.getElementById("msgDisplayhead").innerHTML = "From: " + messageItem.user_name;
                            document.getElementById("msgDisplayModal").classList.add("active");
                            document.getElementById("msgListModal").classList.remove("active");
                            fetchMsgFunc();
                        }
                    });
                }
                else {
                    let ul = document.getElementById('msgListUl');
                    ul.innerHTML = "";
                    let li = document.createElement("li");
                    li.className = "table-view-cell ";
                    li.innerHTML = "You have no messegas!"
                    ul.appendChild(li);
                }
            }
            else {
                let ul = document.getElementById('msgListUl');
                ul.innerHTML = "";
                let li = document.createElement("li");
                li.className = "table-view-cell ";
                li.innerHTML = "You have no messegas!"
                ul.appendChild(li);
            }
        }
    }
};
app.initialize();