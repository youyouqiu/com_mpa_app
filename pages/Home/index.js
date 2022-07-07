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
   Button,
 } from 'react-native';
 import AsyncStorage from '@react-native-async-storage/async-storage';
 import { postLogin } from '../../services/api/logins';
 
 const Home = ({ navigation }) => {
   const [selectedTab, setSelectedTab] = useState('Home');

   const Login = async() => {
    // let tokenData = AsyncStorage.getItem('token');
    let tokenData = '';
    const paramsData = {
      account: 'qjAdmin',
      password: '12345',
      captcha: '',
      kaptchaKey: '',
      tenantCode: '',
    };
    if (tokenData) {

    } else {
      try {
        // const loginData = await postLogin(paramsData);
        // console.log(loginData, 'loginData');
        
        // AsyncStorage.setItem('token', loginData.token);
      } catch(err) {
        console.log(err, 'err');
      } finally {
  
      }
    }
  }

  Login();
 
   const onSelectTab = (item) => {
     setSelectedTab(item);
   }
 
   return (
     <View style={styles.content}>
        <Text>{ selectedTab }</Text>
        <Button
          title="Go to Details"
          onPress={() => navigation.navigate('HomeDetails', {
            pagesId: '0001',
            otherParam: 'i am here',
          })}
        />
     </View>
   );
 };
 
 const styles = StyleSheet.create({
   content:{
     flex: 1,
     alignItems: 'center',
     justifyContent: 'center'
   }
 });
 
 export default Home;
 