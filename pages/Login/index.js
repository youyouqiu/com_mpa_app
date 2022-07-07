/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

 import React, { useState, useEffect, useRef } from 'react';
 import {
   StyleSheet,
   Text,
   View,
   TouchableOpacity,
   TextInput,
   Alert,
 } from 'react-native';
 import AsyncStorage from '@react-native-async-storage/async-storage';
 import { postLogin } from '../../services/api/logins';
 
 const Login = ({ navigation }) => {
   const [selectedTab, setSelectedTab] = useState('Login');
   const [user, onChangeUser] = React.useState('');
   const [password, onChangePassword] = React.useState('');
   const [tokenType, setTokenType] = useState(false);

   const LoginData = async() => {
    await AsyncStorage.removeItem('token');
    const loginParamsData = {
      // account: 'qjAdmin',
      // password: '12345',
      account: user,
      password: password,
      captcha: '',
      kaptchaKey: '',
      tenantCode: '',
    };
    // 保持登录
    // await AsyncStorage.getItem('token').then((data) => {
    //   console.log(data, 'data');

    //   if (data) {
    //     setTokenType(true);
    //   } else {
    //     setTokenType(false);
    //   }
    // }).catch(() => {
    //   console.log(err, 'err');
    // });

    try {
      if (tokenType) {
      
      } else {
        const loginData = await postLogin(JSON.stringify(loginParamsData));
        if (loginData && loginData.data && loginData.success) {
          const tokenData = loginData.data;
          await AsyncStorage.setItem('token', tokenData);
          navigation.navigate('LoginDetails', {
            pagesId: '0001',
            otherParam: 'i am here',
          });
        } else {
          Alert.alert(
            "登录提示：",
            "登录失败，账号密码错误~！",
            [
              {
                text: "Cancel",
                onPress: () => console.log("Cancel Pressed"),
                style: "cancel"
              },
              { text: "OK", onPress: () => console.log("OK Pressed") }
            ]
          );
        }
      }
    } catch(err) {
      console.log(err, 'err');
      Alert.alert(
        "登录提示：",
        "登录失败，网络错误~！",
        [
          {
            text: "Cancel",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel"
          },
          { text: "OK", onPress: () => console.log("OK Pressed") }
        ]
      );
    } finally {

    }
  }

  const onLogining = () => {
    LoginData();
  }

  // LoginData();
 
   const onSelectTab = (item) => {
     setSelectedTab(item);
   }
 
   return (
      <View style={styles.content}>
        <View style={{marginBottom: 69}}>
          <Text style={styles.title}>{ selectedTab }</Text>
        </View>
        <View style={[styles.textInputWrap, {marginBottom: 20}]}>
          <Text>用户：</Text>
          <TextInput
            style={styles.textInput}
            onChangeText={text => onChangeUser(text)}
            value={user}
            placeholder={'请输入用户名'}
          />
        </View>
        <View style={[styles.textInputWrap, {marginBottom: 69}]}>
        <Text>密码：</Text>
          <TextInput
            style={styles.textInput}
            onChangeText={text => onChangePassword(text)}
            value={password}
            placeholder={'请输入密码'}
          />
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={onLogining}
        >
          <Text style={{color: '#FFF'}}>登 录</Text>
        </TouchableOpacity>
     </View>
   );
 };
 
 const styles = StyleSheet.create({
    content: {
      flex: 1,
      flexDirection: 'column',
      flexWrap: 'nowrap',
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontSize: 38,
      fontWeight: 'bold',
      color: '#000',
    },
    textInputWrap: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'nowrap',
      justifyContent: 'center',
      alignItems: 'center',
    },
    textInput: {
      width: 200,
      height: 40,
      borderColor: 'gray',
      borderWidth: 1,
    },
    button: {
      width: 240,
      height: 40,
      backgroundColor: '#2196f3',
      borderRadius: 3,
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'nowrap',
      justifyContent: 'center',
      alignItems: 'center',
    },
 });
 
 export default Login;
 