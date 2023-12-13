const requestModal = document.querySelector('.new-request');
const requestLink = document.querySelector('.add-request');
const requestForm = document.querySelector('.new-request form');

// open request modal
requestLink.addEventListener('click', () => {
    requestModal.classList.add('open');
});

// close request modal
requestModal.addEventListener('click', (e) => {
    if (e.target.classList.contains('new-request')) {
        requestModal.classList.remove('open');
    }
});


// add a new request
requestForm.addEventListener('submit', (e) => {
    // to prevent default loading
    e.preventDefault();

    // geting a hand on to the cloud function to add a new request
    const addRequest = firebase.functions().httpsCallable('addRequest');
    addRequest({
        // the following wil get the calue from the input field
        text: requestForm.request.value,
    }).then(() => {
        requestForm.reset();
        requestModal.classList.remove('open');
        requestForm.querySelector('.error').textContent = '';
    })
        .catch(error => {
            requestForm.querySelector('.error').textContent = error.message;
        })
});

// notification
const notification = document.querySelector('.notification');

const showNotification = (message) => {
    notification.textContent = 'hello world';
    notification.classList.add('active');
    console.log(message)
    setTimeout(() => {
        notification.classList.remove('active');
        notification.textContent = '';
    }, 4000);
}