/* eslint-disable */

const functions = require("firebase-functions");
const admin = require('firebase-admin');
admin.initializeApp();

/**
 * When we call onRequest object we can send data with response object
 * When we call onCall object we have to send data with return
 */

// auth trigger (new user signup)
exports.newUserSignUp = functions.auth.user().onCreate(user => {
    // For background triggers you must return a value/promise
    // using user id as the document ID
    return admin.firestore().collection('users').doc(user.uid).set({
        email: user.email,
        upvotedOn: [],
    });
});



// auth trigger ( user deleted)
exports.userDeleted = functions.auth.user().onDelete(user => {
    // For background triggers you must return a value/promise
    const doc = admin.firestore().collection('users').doc(user.uid);
    return doc.delete();
});



// HTTTP Callable Functions (adding a tutorial request)
exports.addRequest = functions.https.onCall((data, context) => {
    // using context to see if the user is authenticated.
    if (!context.auth) {
        // refere to firebase 
        throw new functions.https.HttpsError(
            'unauthenticated',
            'only authenticated user can add request'
        );
    }
    if (data.text.length > 30) {
        // refere to firebase for more errors
        // cloud functions can send errors whenever the function gets called.
        throw new functions.https.HttpsError(
            'invalid-argument',
            'request must be no more than 30 char long'
        );
    }
    // adding a new document in to a . collection
    return admin.firestore().collection('request').add({
        text: data.text,
        upvotes: 0,
    });
});

// upVote Callable fuctions
exports.upvote = functions.https.onCall((data, context) => {

    // check the auth state
    if (!context.auth) {
        // refere to firebase 
        throw new functions.https.HttpsError(
            'unauthenticated',
            'only authenticated user can add request'
        );
    }

    // get refs for user doc a& request doc
    const user = admin.firestore().collection('user').doc(context.auth.uid);
    // we will be receiving the id of the request through the data parameter 
    const request = admin.firestore().collection('request').doc(data.id);
})