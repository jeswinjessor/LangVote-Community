// This file is responsible for displaying the request crud in the ui

// Vue.js
var app = new Vue({
    // the #app is refering to the id of the <section> tag in html
    el: '#app',
    data: {
        requests: []
    },
    methods: {
        // Since we need to have more than one methods inside the section tag
        // we need to have a method property to define those function  which will 
        // be taken care by Vue.js
        upvoteRequest(id) {

            const upvote = firebase.functions().httpsCallable('upvote');
            upvote({ id })
                .catch(error => {
                    showNotification(error.message);
                });
        }
    },
    // mounted life-cycle hook, 
    // the following function will execute when the vue mount the hook
    mounted() {
        // Grabbing a reference to request collection from database
        const ref = firebase.firestore().collection('request');

        // When we use snapshot, every time the data changed we get a new snapshot,
        // and will execute the following functions.
        ref.onSnapshot(snapshot => {

            let requests = [];
            snapshot.forEach(doc => {
                // spread operator ...  this is how you get data from every single document
                requests.push({ ...doc.data(), id: doc.id });
            })

            // let html = '';
            // requests.forEach(request => {
            //     html += `<li>${request.text}</li>`;
            // });
            // document.querySelector('ul').innerHTML = html; 

            // We don't need the above method to output data to the html, vue will that as following

            this.requests = requests;
            // the above will pass down requests array to the vue requests
        })
    }
});



