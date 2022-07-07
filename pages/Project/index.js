/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  Alert,
  NativeModules,
  DeviceEventEmitter,
} from 'react-native';

// import AsyncStorage from '@react-native-async-storage/async-storage';
import SerialPortAPI from 'react-native-serial-port-api';
import moment from 'moment';
// import {
//   MapView,
//   MapTypes,
//   Geolocation
// } from 'react-native-baidu-map';
import { getPageList, getSelectFirst, getAlarmList, postGPSAdd, getKGAdd } from '../../services/api/pages';
import MyBle from '../../util/bluetooth';

const Project = () => {
  const [selectedTab, setSelectedTab] = useState('Project');
  const [pageData, setPageData] = useState([]);
  const [selectFirstData, setSelectFirstData] = useState({});
  const [alarmData, setAlarmData] = useState([]);
  const [colorType, setcolorType] = useState(false);
  const [touchButtonDisabled, setTouchButtonDisabled] = useState(false);
  const [timer, setTimer] = useState(null);
  const [hexToNum, setHexToNum] = useState(0);
  const [stringDataLong, setStringDataLong] = useState('');
  const [stringDataLat, setStringDataLat] = useState('');
  const imgsKong = require('../../images/huoche_1.png');
  const imgsMan = require('../../images/huoche_2.png');
  // 蓝牙权限
  const permissions = ['android.permission.ACCESS_COARSE_LOCATION'];
  let permissionType = false;

  useEffect(() => {
    initPageList();
    initSelectFirst();
    initAlarmList();
    // MyBle.Init();
  }, []);

  // 获取列表
  const initPageList = async() => {
    const pageParamsData = {
      pageSize: 10,
      pageNo: 1,
    };
    try {
      const pageList = await getPageList(pageParamsData);
      const pageListData = pageList.data.data.records || [];
      if (pageListData && pageListData[0]) {
        setPageData(pageListData);
      }
      console.log(pageList, 'pageList');
    } catch(err) {
      console.log(err, 'err');
    } finally {

    }
  }

  // 获取第一条运输任务
  const initSelectFirst = async() => {
    const selectFirstParamsData = 'faferdgsdfgfpading12567';
    try {
      const selectFirst = await getSelectFirst(selectFirstParamsData);
      const selectFirstData = selectFirst.data.data || {};
      if (selectFirstData && selectFirstData.id) {
        setSelectFirstData(selectFirstData);
      }
      console.log(selectFirst, 'selectFirst');
    } catch(err) {
      console.log(err, 'err');
    } finally {

    }
  }

  // 获取报警列表
  const initAlarmList = async() => {
    try {
      const alarmList = await getAlarmList();
      const alarmListData = alarmList.data.data.records || [];
      if (alarmListData && alarmListData[0]) {
        setAlarmData(alarmListData);
      }
      console.log(alarmList, 'alarmList');
    } catch(err) {
      console.log(err, 'err');
    } finally {

    }
  }

  // 获取233串口的重量信息
  const exampleSerial = async(type) => {
    const serialPort = await SerialPortAPI.open("/dev/ttyS1", { baudRate: 9600 });
    // 订阅信息（监听串口的状态 和 监听串口回传数据）
    const sub = serialPort.onReceived(buff => {
      // console.log(buff.toString('hex').toUpperCase());
      // console.log(buff);
      if (buff) {
        const newSerialPortData = buff.toString('hex').toUpperCase();
        const newNum = intToStringNum(newSerialPortData);
        // console.log(newSerialPortData, 'newSerialPortData');
        // Alert.alert(`串口数据 ---- ${newSerialPortData}`);
        onKGAdd(newNum, type);
        onColorChange(type);
        setHexToNum(newNum);
      }
    })
    // unsubscribe
    // sub.remove();
    // 发送数据
    await serialPort.send('0x52');
    // 4s后关闭
    setTimeout(() => {
      serialPort.close();
    }, 4000);
  }

  // hex转数字
  const hexToInt = (hexStr) => {
    let twoStr = parseInt(hexStr, 16).toString(2); // 将十六转十进制，再转2进制
    const bitNum = hexStr.length * 4; // 1个字节 = 8bit ，0xff 一个 "f"就是4位
    if (twoStr.length < bitNum) {
      while(twoStr.length < bitNum) {
        twoStr = "0" + twoStr;
      }
    }
    if(twoStr.substring(0, 1) == "0") {
      // 正数
      twoStr = parseInt(twoStr, 2); // 二进制转十进制
      return twoStr;
    } else {
      // 负数
      let twoStr_unsign = "";
      twoStr = parseInt(twoStr, 2) - 1; // 补码：(负数)反码+1，符号位不变；相对十进制来说也是 +1，但这里是负数，+1就是绝对值数据-1
      twoStr = twoStr.toString(2);
      twoStr_unsign = twoStr.substring(1, bitNum); // 舍弃首位(符号位)
      // 去除首字符，将0转为1，将1转为0   反码
      twoStr_unsign = twoStr_unsign.replace(/0/g, "z");
      twoStr_unsign = twoStr_unsign.replace(/1/g, "0");
      twoStr_unsign = twoStr_unsign.replace(/z/g, "1");
      twoStr = parseInt(- twoStr_unsign, 2);
      return twoStr;
    }
  }

  const intToStringNum = (numStr) => {
    if (typeof numStr !== 'string') {
      numStr = numStr + '';
    }
    // try {
      let ii = -1;
      const numArr = numStr.split('');
      const newNumArr = [...numArr];
      for (let i = 0; i < numArr.length; i++) {
        if (i !== 0 && i % 2 === 0) {
          ii++
          newNumArr.splice(i + ii, 0, '-');
        }
      }
      const bb = newNumArr.join('');
      const cc = bb.split('-');
      let dd = '';
      let ee = '';
      for (let j = 0; j < cc.length; j++) {
        dd = hexToInt(cc[j]);
        ee = ee + String.fromCharCode(dd);
      }
      ee = parseFloat(ee.replace('wn', ''));
      return ee;
    // } catch(err) {
    //   Alert.alert(`串口数据错误`);
    // }
  }

  // 重量信息上传
  const onKGAdd = async(data, type) => {
    try {
      const kgParams = {
        rwid: selectFirstData.id || '1001',
        weight: data || '',
        type: '1',
      }
      if (type) {
        kgParams.type = '1';
      } else {
        kgParams.type = '2';
      }
      const kgData = await getKGAdd(kgParams);
      console.log(kgData, 'kgData');
    } catch(err) {
      console.log(err, 'err');
    } finally {

    }
  }

  // gps信息上传
  const onGPSAdd = async(data) => {
    const newDate = moment().format('YYYY-MM-DD HH-mm-ss');
    const params = {
      // createtime: newDate,
      // id: "admin",
      rwid: selectFirstData.id || '1001',
      jd: data.long,
      wd: data.lat,
    }
    try {
      const GPSAdd = await postGPSAdd(JSON.stringify(params));
      console.log(GPSAdd, 'GPSAdd');
    } catch(err) {
      console.log(err, 'err');
    } finally {

    }
  }
  
  const onSelectTab = (item) => {
    setSelectedTab(item);
  }

  // 车辆载重信息（空/满）
  const onColorChange = (type) => {
    setcolorType(type);
  }

  // 蓝牙授权
  const permissionBluetooth = async() => {
    permissionType = true;
    if (Platform.OS === "android") {
      for (const permission of permissions) {
        const check = await PermissionsAndroid.check(permission);
        console.log(`permission ${permission} check ${check}`);
        if (!check) {
          await PermissionsAndroid.request(permission);
        }
      }
    }
  }

  // 蓝牙列表
  const onBlueTooth = () => {
    if (!permissionType) {
      permissionBluetooth();
    }
    MyBle.SearchBle(null, (data) => {
      console.log(data, 'data');
    }, (err) => {
      console.log(err, 'err');
    });
    MyBle.ConnectBle('F4:87:C5:71:9B:60', (data) => {
      console.log(data, 'data');
    }, (err) => {
      console.log(err, 'err');
    });
  }

  // 打开地图监听
  const onScanningResult = () => {
    setTouchButtonDisabled(true);
    // 打开地图定位
    NativeModules.ToastModule.startDataToJS(() => {}, (e) => {console.log(e, 'start')});
    const obj = {}
    // 获取经纬度（9秒间隔）
    const newTimer = setInterval(() => {
      // 经度
      NativeModules.ToastModule.dataToRNLong((data) => {
        setStringDataLong(data);
        obj.long = data;
      }, (err) => {
        console.log(err, 'errLong');
      });
      // 纬度
      NativeModules.ToastModule.dataToRNLat((data) => {
        setStringDataLat(data);
        obj.lat = data;
      }, (err) => {
        console.log(err, 'errLat');
      });
      onGPSAdd(obj);
    }, 9000);
    setTimer(newTimer);
    Alert.alert('GPS定位已打开');
  }

  // 关闭定位传输
  const onClose = () => {
    clearInterval(timer);
    NativeModules.ToastModule.stopDataToJS(() => {}, (e) => {console.log(e, 'stop')});
    setTouchButtonDisabled(false);
    Alert.alert('GPS定位已关闭');
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.leftContent}>
        <View style={[styles.leftContentTop, styles.leftContentTopColor]}>
          <View style={styles.title}>
            <Text style={styles.fontTextTitle}>装载信息</Text>
          </View>
          <View style={styles.content}>
            <View style={styles.leftList}>
              <View style={styles.leftItem}>
                <Text style={styles.fontText}>货物名称：</Text>
                <Text style={[styles.fontText, {color: 'blue', fontWeight: 'bold'}]}>{selectFirstData.wlmc || '暂无数据'}</Text>
              </View>
              <View style={styles.leftItem}>
                <Text style={styles.fontText}>物料编号：</Text>
                <Text style={[styles.fontText, {color: 'blue', fontWeight: 'bold'}]}>{selectFirstData.wlph || '暂无数据'}</Text>
              </View>
              <View style={styles.leftItem}>
                <Text style={styles.fontText}>目的地：</Text>
                <Text style={[styles.fontText, {color: 'blue', fontWeight: 'bold'}]}>{selectFirstData.mdd || '暂无数据'}</Text>
              </View>
            </View>
            <View style={styles.leftListRight}>
              <Text style={styles.fontText}>重量：</Text>
              <Text style={styles.fontTextBold}>
                {hexToNum}
                <Text style={styles.fontText}> kg</Text>
              </Text>
              <View style={{display: 'flex', display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'flex-start'}}>
                <TouchableOpacity
                  style={[styles.touchButton, {backgroundColor: 'green', width: 120}]}
                  onPress={() => {exampleSerial(true)}}
                >
                  <Text style={{color: '#FFF', textAlign: 'center'}}>重量数据-开始</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.touchButton, {width: 120}]}
                  onPress={() => {exampleSerial(false)}}
                >
                  <Text style={{color: '#FFF', textAlign: 'center'}}>重量数据-结束</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.leftContentTop}>
          <View style={{width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'space-around'}}>
            <Text>{`经纬度信息：${stringDataLong}，${stringDataLat}`}</Text>
            <Text>{`车辆装载信息：${colorType ? '满' : '空'}`}</Text>
          </View>
          <Image
            style={styles.box}
            source={colorType ? imgsMan : imgsKong}
          />
        </View>
      </View>

      <View style={styles.rightContent}>
        <View style={{ padding: 10 }}>
          <Text style={styles.fontTextTitle}>报警信息</Text>
        </View>
        <ScrollView style={styles.scroll}>
          <View style={styles.rightContentTop}>
            {
              alarmData.map((item, index) => {
                return (
                  <View key={item.id} style={styles.rightItem}>
                    <Text style={styles.fontText}>{`${item.createtime}：` || '暂无数据'}</Text>
                    <Text style={[styles.fontText, {color: 'red', fontWeight: 'bold'}]}>{ item.message || '暂无数据' }</Text>
                  </View>
                )
              })
            }
          </View>
        </ScrollView>
        <View style={styles.rightContentBottom}>
          <View style={{ paddingBottom: 10 }}>
            <Text style={styles.fontTextTitle}>驾驶信息</Text>
          </View>
          <View style={styles.rightItem}>
            <Text style={styles.fontText}>驾驶人员：</Text>
            <Text style={styles.fontTextBold}>{selectFirstData.sj || '暂无数据'}</Text>
          </View>
          <View style={styles.rightItem}>
            <Text style={styles.fontText}>护卫人员：</Text>
            <Text style={styles.fontTextBold}>{selectFirstData.ab || '暂无数据'}</Text>
          </View>
          <View style={styles.rightItem}>
            <TouchableOpacity
              style={[styles.touchButton, {backgroundColor: 'green'}]}
              onPress={onScanningResult}
              disabled={touchButtonDisabled}
            >
              <Text style={{color: '#FFF'}}>gps数据-开始</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.touchButton}
              onPress={onClose}
            >
              <Text style={{color: '#FFF'}}>gps数据-结束</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>

  );
};

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'space-around',
    backgroundColor: '#eee',
  },
  fontTextTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  fontText: {
    fontSize: 16,
  },
  fontTextBold: {
    fontSize: 33,
    fontWeight: 'bold',
    color: 'red',
  },
  title: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
  content: {
    flex: 2,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'space-around',
  },
  scroll: {
    height: '20%',
  },
  leftList: {
    flex: 1,
    flexDirection: 'column',
    flexWrap: 'nowrap',
  },
  leftListRight: {
    flex: 1,
    flexDirection: 'column',
    flexWrap: 'nowrap',
    justifyContent: 'center',
  },
  leftItem: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'center',
  },
  box: {
    width: 300,
    height: 175,
  },
  boxColor1: {
    backgroundColor: 'green',
  },
  boxColor2: {
    backgroundColor: 'yellow',
  },
  leftContent: {
    flex: 2,
    flexWrap: 'nowrap',
    flexDirection: 'column',
    borderRightWidth: 8,
    borderColor: '#FFF',
  },
  leftContentTop: {
    flex: 1,
    flexWrap: 'nowrap',
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  },
  leftContentTopColor: {
    borderBottomWidth: 8,
    borderColor: '#FFF',
  },
  rightContent: {
    flex: 1,
    flexWrap: 'nowrap',
    flexDirection: 'column',
  },
  rightContentTop: {
    flex: 2,
    flexWrap: 'nowrap',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 10,
  },
  rightContentBottom: {
    flex: 1,
    flexWrap: 'nowrap',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingTop: 24,
    paddingBottom: 10,
    paddingLeft: 10,
    borderTopWidth: 8,
    borderColor: '#FFF',
  },
  rightItem: {
    // flex: 1,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  touchButton: {
    backgroundColor: 'red',
    borderRadius: 3,
    padding: 10,
    marginRight: 20,
  }
});

export default Project;
