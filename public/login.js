/* eslint-disable */
// import axios from 'axios';
import { showAlert } from './alerts.js';

// export const login = async (email, password) => {
//   try {
//     const res = await axios({
//       method: 'POST',
//       url: 'http://127.0.0.1:3000/api/v1/users/login',
//       data: {
//         email,
//         password
//       }
//     });

//     if (res.data.status === 'success') {
//       showAlert('success', 'Logged in successfully!');
//       window.setTimeout(() => {
//         location.assign('/');
//       }, 1500);
//     }
//   } catch (err) {
//     showAlert('error', err.response.data.message);
//   }
// };

// export const logout = async () => {
//   try {
//     const res = await axios({
//       method: 'GET',
//       url: 'http://127.0.0.1:3000/api/v1/users/logout'
//     });
//     if ((res.data.status = 'success')) location.reload(true);
//   } catch (err) {
//     console.log(err.response);
//     showAlert('error', 'Error logging out! Try again.');
//   }
// };

const login = async (email, password) => {
    // console.log(email, password);
    try {
        const res = await axios({
            method: 'POST',
            url: '/login',
            data: {
                email,
                password
            }
        });
            
        if (res.data.status === 'success') {
          window.alert('Logged in successfully!');
          location.assign('/');
        }
      } catch (err) {
        // console.log(JSON.stringify(err.response.data));
        // const errorMessage = err.response.data.match(/Error: (.*)\s+/)[1];
        // const errorWithoutFilePath = errorMessage.split('<br>')[0].trim();
        // // console.log(errorWithoutFilePath)
        // showAlert('error', errorWithoutFilePath);
        window.alert('Invalid email or password!');
      }
}



document.querySelector('.form').addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);

});