import Ajax from '../index';

// 获取页面列表
export const getPageList = (data) => Ajax.get(
    `http://124.70.138.246:10003/findPageHostingInformation`,
    data
);

// 根据登录的用户获取运输任务
export const getSelectFirst = (data) => Ajax.get(
    `http://124.70.138.246:10003/selectFirst/${data}`,
    data
);

// 获取报警列表
export const getAlarmList = (data) => Ajax.get(
    `http://124.70.138.246:10003/pageAllWarningMessage`,
    data
);

// 上传GPS信息
export const postGPSAdd = (data) => Ajax.safePost(
    `http://124.70.138.246:10003/gpsAdd`,
    data
);

// 上传重量信息
export const getKGAdd = (data) => Ajax.get(
    `http://124.70.138.246:10003/weight/${data.rwid}/${data.weight}/${data.type}`,
    data
);
