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
 } from 'react-native';
 
 const HomeDetails = (props) => {
   console.log(props, 'props');
   const [selectedTab, setSelectedTab] = useState('HomeDetails');
 
   const onSelectTab = (item) => {
     setSelectedTab(item);
   }
 
   return (
     <View style={styles.content}>
       <Text>{ selectedTab }</Text>
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
 
 export default HomeDetails;
 