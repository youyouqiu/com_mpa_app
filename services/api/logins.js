import Ajax from '../index';
// import { APP_URL } from '../../.env';

// console.log(APP_URL, 'APP_URL');

// 获取页面列表
export const postLogin = (data) => Ajax.safeLoginPost(
    `http://124.70.138.246:10003/login`,
    data
)