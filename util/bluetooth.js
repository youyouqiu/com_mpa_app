/**
 *
 * 这是RN的蓝牙模块-----android
 * **/

 import { BleManager } from 'react-native-ble-plx';
 import { Buffer } from 'buffer';
 
 global.isConnected = false;
 global.isBleOpen = false;
 
 let isOnlyOne = false;
 
 module.exports = {
    Init() {
        this.manager = new BleManager();
        console.log('蓝牙已初始化');
        this.NoticeStateChange();
    },
 
    /**
      * 蓝牙状态监听*/
    NoticeStateChange() {
        this.manager.onStateChange((state) => {
            console.log('蓝牙状态===', state);
            if (state === 'PoweredOff') {
                global.isConnected = false
                global.isBleOpen = false
                alert('Bluetooth is turned off. Please turn on Bluetooth and proceed to the next step');
            }

            if (state === 'PoweredOn') {
                global.isBleOpen = true
            }
        }, true);
    },
 
    /**
    * 蓝牙搜索-----默认 5 秒, 如果传入设备名称，就返回所要搜索的设备,如果不传则默认 5秒后 返回搜索得到的列表*/
    SearchBle(deviceName, successCallback, errorCallback, seconds = 5000,) {
        this.timer && clearTimeout(this.timer);
        console.log('开始搜索=====>>>>>');
        let device_list = [];
        this.manager.startDeviceScan(null, null, (error, device) => {
            if (error) {
                // Handle error (scanning will be stopped automatically)
                errorCallback(error);
                return
            }
            // console.log('扫描到的设备===', device)
            if (deviceName) {
                // if (device.name === deviceName && device.serviceUUIDs !== null) {
                if (device.localName === deviceName) {
                    // Stop scanning as it's not necessary if you are scanning for one device.
                    device_list.push(device);
                    successCallback(device_list);
                    this.manager.stopDeviceScan();
                    this.timer && clearTimeout(this.timer);
                }
            } else {
                device_list.push(device);
            }
        });
        if (global.isBleOpen) {
            this.timer = setTimeout(() => {
                console.warn('扫描结束====停止扫描',)
                successCallback(device_list);
                this.manager.stopDeviceScan();
            }, seconds);
        }
    },
 
 
    ConnectBle(macId, successCallback, errorCallback) {
        console.log(macId, 'macId');
        if (global.isConnected) {
            alert('Only one Bluetooth can be connected');
            errorCallback('device is already connected');
        } else {
            this.manager.connectToDevice(macId, {autoConnect: true}).then((device) => {
                console.log('connect success===', device);
                global.isConnected = true;
                // 查找设备的所有服务、特征和描述符。
                this.manager.discoverAllServicesAndCharacteristicsForDevice(device.id).then((data) => {
                    // 如果所有可用的服务和特征已经被发现，它会返回能用的Device对象。
                    console.log('all available services and characteristics device: ', device);
                    this.GetServiceId(device, successCallback, errorCallback);
                }, err => console.log('get all available services and characteristics device fail : ', err));
            }).catch((err) => {
                console.log('connect fail===', err);
                errorCallback(err);
            })
        }
    },
 
    //获取蓝牙设备的服务uuid, 5.0  //服务uuid可能有多个
    GetServiceId(device, successCallback, errorCallback) {
        this.manager.servicesForDevice(device.id).then((data) => {
            // 为设备发现的服务id对象数组
            console.log('services list: ', data);
            this.mac_id = device.id;
            let server_uuid = data[2].uuid;
            this.GetCharacterIdNotify(server_uuid, successCallback, errorCallback);
        }, err => console.log('services list fail===', err));
    },
 
    // 根据服务uuid获取蓝牙特征值,开始监听写入和接收
    GetCharacterIdNotify(server_uuid, successCallback, errorCallback) {
        this.manager.characteristicsForDevice(this.mac_id, server_uuid).then((data) => {
            console.log('characteristics list: ', data);
            this.writeId = data[0].serviceUUID; //写入id
            this.notifyId = data[0].uuid; //接收id
            this.StartNoticeBle();
            this.onDisconnect();
            successCallback(this.mac_id, this.writeId, this.notifyId);
        }, err => {console.log('characteristics list fail:', err);errorCallback(err)});
    },
 
    // 开启蓝牙监听功能
    StartNoticeBle() {
        console.log('开始数据接收监听', this.mac_id, this.writeId, this.notifyId);
        this.manager.monitorCharacteristicForDevice(this.mac_id, this.writeId, this.notifyId, (error, characteristic) => {
            if (error) {
                console.log('ble response hex data fail：', error);
                global.isConnected = false;
                this.DisconnectBle();
            } else {
                let resData = Buffer.from(characteristic.value, 'base64').toString('hex');
                console.log('ble response hex data:', resData);
                this.responseData = resData;
            }
        }, 'monitor');
    },
 
    //  三、 设备返回的数据接收
    BleWrite(value, successCallback, errorCallback) {
        this.responseData = '';
        this.recivetimer && clearInterval(this.recivetimer);
        if (!global.isConnected) {
            alert(' Bluetooth not connected ');
            return;
        }
        let formatValue = Buffer.from(value, 'hex').toString('base64');
        this.manager.writeCharacteristicWithResponseForDevice(this.mac_id, this.writeId,
            this.notifyId, formatValue, 'write')
            .then(characteristic => {
                let resData = Buffer.from(characteristic.value, 'base64').toString('hex');
                console.log('write success', resData);
                this.recivetimer = setInterval(() => {
                    if(this.responseData){
                        // console.log('while do ===',this.responseData);
                        successCallback(this.responseData)
                        this.recivetimer && clearInterval(this.recivetimer)
                    }
                }, 500);
            }, error => {
                console.log('write fail: ', error);
                errorCallback(error);
                // alert('write fail: ', error.reason);
            });
    },
 
    // 只需向设备下发指令，无需接收
    BleWrite1(value, successCallback, errorCallback) {
        if (!global.isConnected) {
            if (!isOnlyOne) {
                isOnlyOne = true;
                alert(' Bluetooth not connected ');
            }
            return;
        }
        let formatValue = Buffer.from(value, 'hex').toString('base64');
        this.manager.writeCharacteristicWithoutResponseForDevice(this.mac_id, this.writeId,
            this.notifyId, formatValue, 'write')
            .then(characteristic => {
                let resData = Buffer.from(characteristic.value, 'base64').toString('hex');
                console.log('write success1', resData);
            }, error => {
                console.log('write fail: ', error);
                errorCallback(error);
                // alert('write fail: ', error.reason);
            });
    },
 
    // write(value,index){
    //     let formatValue;
    //     if(value === '0D0A') {  //直接发送小票打印机的结束标志
    //         formatValue = value;
    //     }else {  //发送内容，转换成base64编码
    //         // formatValue = new Buffer(value, "base64").toString('ascii');
    //         formatValue = Buffer.from(value, 'hex').toString('base64');
    //     }
    //     let transactionId = 'write';
    //     return new Promise( (resolve, reject) => {
    //         this.manager.writeCharacteristicWithResponseForDevice(this.mac_id,this.writeId,
    //             this.notifyId,formatValue,transactionId)
    //             .then(characteristic => {
    //                 console.log('write success',value);
    //                 resolve(characteristic);
    //             },error => {
    //                 console.log('write fail: ',error);
    //                 // this.alert('write fail: ',error.reason);
    //                 reject(error);
    //             })
    //     });
    // },
 
    // 手动停止搜索----在搜索里面，可以自己修改
    StopSearchBle () {
        this.manager.stopDeviceScan();
    },
 
    // 关闭蓝牙连接
    DisconnectBle() {
        if(!this.mac_id){
            return
        }
        this.manager.cancelDeviceConnection(this.mac_id)
            .then(res=>{
                console.warn('disconnect success',res);
                global.isConnected = false;
            })
            .catch(err=>{
                console.warn('disconnect fail',err);
                alert(' Bluetooth disconnection failed :',err);
            })
    },
 
    // 关闭蓝牙模块
    destroy () {
        global.isConnected = false;
        this.manager.destroy();
    },
 
    // 监听蓝牙断开
    onDisconnect () {
        this.manager.onDeviceDisconnected(this.mac_id,(error, device) => {
            if (error) {  //蓝牙遇到错误自动断开
                console.log('onDeviceDisconnected', 'device disconnect', error);
            } else {
                console.log('蓝牙连接状态' ,device);
            }
        })
    },
 
    /**==========工具函数=========**/
    // 指令生成
    order(instruction, data) { //传入指令和内容
        // let instruction = '02',data = '00'
        let length = (instruction + data).length / 2;
        let hexLength = this.ten2Hex(length); //十六进制长度
        // console.log('lenth==',length,hexLength)
 
        let str = instruction + data; //命令字与数据包字节
        let id = 0;
        let sum = 0;
        for (let i = 0; i < str.length / 2; i++) {
            id += 2
            let hexstr = str.slice(id - 2, id); //将数据拆分，将其转成10进制累加
            let intstr = this.hex2int(hexstr); //十进制
            sum += intstr;
        }
 
        let checkstr = String(sum);
        let check = checkstr.slice(checkstr.length - 2, checkstr.length); //取得累加和后两位数后，转成16进制校验码
        let hexcheck = this.ten2Hex(check);
 
        // console.log('最终和为==',sum,check,hexcheck)
        let order = '550000' + '00' + hexLength + instruction + data + hexcheck + 'AA'; // '00' 与 hexLength 共两个字节， hexLength 最大为ff,即长度暂时不要超过255,若是需要长度超过255的需要判断16进制的数据是否需要自动进位,本项目不需要再多做处理
        return order;
    },
 
 
    // 字符转换成16进制发送到服务器
    Char2Hex(str) {
        if (str === "") {
            return "";
        } else {
            var hexCharCode = '';
            for (var i = 0; i < str.length; i++) {
                hexCharCode += (str.charCodeAt(i)).toString(16);
            }
            return hexCharCode; //  tuh:  747568
        }
    },
 
    // 字符转换成16进制发送到服务器[转换放到新数组]
    Char2Hex2(str) {
        if (str === "") {
            return "";
        } else {
            var hexCharCode = [];
            for (var i = 0; i < str.length; i++) {
                hexCharCode.push('0x' + (str.charCodeAt(i)).toString(16));
            }
            hexCharCode.join(",");
            return hexCharCode; //tuh:  ["0x74", "0x75", "0x68"]
        }
    },
 
 
    // ArrayBuffer转16进度字符串示例
    ab2hex(buffer) {
        const hexArr = Array.prototype.map.call(
            new Uint8Array(buffer),
            function (bit) {
                return ('00' + bit.toString(16)).slice(-2)
            }
        );
        return hexArr.join('');
    },
 
    // 16进制转buffer
    hexStringToArrayBuffer(str) {
        if (!str) {
            return new ArrayBuffer(0);
        }
        var buffer = new ArrayBuffer(str.length);
        let dataView = new DataView(buffer);
        let ind = 0;
        for (var i = 0, len = str.length; i < len; i += 2) {
            let code = parseInt(str.substr(i, 2), 16);
            dataView.setUint8(ind, code);
            ind++;
        }
        return buffer;
    },
 
    // 10进制转16进制
    ten2Hex(number) {
        return Number(number) < 16 ? '0' + Number(number).toString(16) : Number(number).toString(16);
    },
 
    // 16进制转10进制整数
    hex2int(hex) {
        var len = hex.length,
            a = new Array(len),
            code;
        for (var i = 0; i < len; i++) {
            code = hex.charCodeAt(i);
            if (48 <= code && code < 58) {
                code -= 48;
            } else {
                code = (code & 0xdf) - 65 + 10;
            }
            a[i] = code;
        }
 
        return a.reduce(function (acc, c) {
            acc = 16 * acc + c;
            return acc;
        }, 0);
    },
 
    // 16进制转10进制浮点数
    hex2Float(t) {
 
        t = t.replace(/\s+/g, "");
        if (t == "") {
            return "";
        }
        if (t == "00000000") {
            return "0";
        }
        if ((t.length > 8) || (isNaN(parseInt(t, 16)))) {
            return "Error";
        }
        if (t.length < 8) {
            t = this.FillString(t, "0", 8, true);
        }
        t = parseInt(t, 16).toString(2);
        t = this.FillString(t, "0", 32, true);
        var s = t.substring(0, 1);
        var e = t.substring(1, 9);
        var m = t.substring(9);
        e = parseInt(e, 2) - 127;
        m = "1" + m;
        if (e >= 0) {
            m = m.substr(0, e + 1) + "." + m.substring(e + 1)
        } else {
            m = "0." + this.FillString(m, "0", m.length - e - 1, true)
        }
        if (m.indexOf(".") == -1) {
            m = m + ".0";
        }
        var a = m.split(".");
        var mi = parseInt(a[0], 2);
        var mf = 0;
        for (var i = 0; i < a[1].length; i++) {
            mf += parseFloat(a[1].charAt(i)) * Math.pow(2, -(i + 1));
        }
        m = parseInt(mi) + parseFloat(mf);
        if (s == 1) {
            m = 0 - m;
        }
        return m;
    },
 
    // 浮点数转16进制
    float2Hex(t) {
        if (t == "") {
            return "";
        }
        t = parseFloat(t);
        if (isNaN(t) == true) {
            return "Error";
        }
        if (t == 0) {
            return "00000000";
        }
        var s,
            e,
            m;
        if (t > 0) {
            s = 0;
        } else {
            s = 1;
            t = 0 - t;
        }
        m = t.toString(2);
        if (m >= 1) {
            if (m.indexOf(".") == -1) {
                m = m + ".0";
            }
            e = m.indexOf(".") - 1;
        } else {
            e = 1 - m.indexOf("1");
        }
        if (e >= 0) {
            m = m.replace(".", "");
        } else {
            m = m.substring(m.indexOf("1"));
        }
        if (m.length > 24) {
            m = m.substr(0, 24);
        } else {
            m = this.FillString(m, "0", 24, false)
        }
        m = m.substring(1);
        e = (e + 127).toString(2);
        e = this.FillString(e, "0", 8, true);
        var r = parseInt(s + e + m, 2).toString(16);
        r = this.FillString(r, "0", 8, true);
        return this.InsertString(r, " ", 2).toUpperCase();
    },
 
    // 需要用到的函数
    InsertString(t, c, n) {
        var r = new Array();
        for (var i = 0; i * 2 < t.length; i++) {
            r.push(t.substr(i * 2, n));
        }
        return r.join(c);
    },

    // 需要用到的函数
    FillString(t, c, n, b) {
        if ((t == "") || (c.length != 1) || (n <= t.length)) {
            return t;
        }
        var l = t.length;
        for (var i = 0; i < n - l; i++) {
            if (b == true) {
                t = c + t;
            } else {
                t += c;
            }
        }
        return t;
    },
 
}
