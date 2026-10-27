import {copy} from './shared.js';
const button=document.querySelector('.copy-install');
button?.addEventListener('click',()=>copy(document.querySelector('#install-code').textContent));
