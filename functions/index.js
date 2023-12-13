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
exports.upvote = functions.https.onCall(async (data, context) => {

    // check the auth state
    if (!context.auth) {
        // refere to firebase 
        throw new functions.https.HttpsError(
            'unauthenticated',
            'only authenticated user can add request'
        );
    }
    // get refs for user doc a& request doc
    const user = admin.firestore().collection('users').doc(context.auth.uid);
    // we will be receiving the id of the request through the data parameter 
    const request = admin.firestore().collection('request').doc(data.id);
    // check if the user already upvoted on the particular tutorial
    try {
        const doc = await user.get();
        // check user hasn't upvoted the request
        if (doc.data().upvotedOn.includes(data.id)) {
            throw new functions.https.HttpsError(
                'failed-precondition',
                'only upvote a requets once'
            );
        }
        await user.update({
            // we are getting all the data 
            upvotedOn: [...doc.data().upvotedOn, data.id]
        });
        request.get().then(doc_1 => {
            let fieldValue = doc_1.data().upvotes || 0;
            fieldValue = fieldValue * 1;
            return request.update({
                upvotes: fieldValue + 1
            });
        }).catch(error => {
            throw new functions.https.HttpsError(
                'failed-precondition',
                `${error.message}`
            );
        });
    } catch (error_1) {
        throw new functions.https.HttpsError(
            'failed-precondition',
            `${error_1.message}`
        );
    }
})

// Firebase Trigger for tracking activity
exports.logActivity = functions.firestore.document('/{collection}/{id}')
    .onCreate((snapshot, context) => {
        const collection = context.params.collection;
        const id = context.params.id;

        const activities = admin.firestore.collection('activities');

        if (collection === 'request') {
            return activities.add({
                text: 'a new request has been added'
            })
        }
        if (collection === 'users') {
            return activities.add({
                text: 'a new user signed up'
            })
        }
        return null;
    })