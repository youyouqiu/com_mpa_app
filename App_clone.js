/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from './pages/Home';
import HomeDetails from './pages/Home/Details';
import Project from './pages/Project';
import User from './pages/User';

const Tab = createBottomTabNavigator();
const Stack1 = createNativeStackNavigator();
const Stack2 = createNativeStackNavigator();
const Stack3 = createNativeStackNavigator();

const App = () => {
  const someData = 'changbaixue';
  // const isDarkMode = useColorScheme() === 'dark';

  // const backgroundStyle = {
  //   backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  // };

  return (
    // <SafeAreaView style={backgroundStyle}>
    //   <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
    //   <View
    //     style={{
    //       backgroundColor: isDarkMode ? Colors.black : Colors.white,
    //     }}
    //   >
    //   </View>
    // </SafeAreaView>
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Homes">
          {
            () => (<Stack1.Navigator>
              <Stack1.Screen
                name="Home"
                component={Home}
                options={{
                  title: 'My home',
                  headerStyle: {
                    backgroundColor: '#3366ff',
                  },
                  headerTintColor: '#fff',
                  headerTitleStyle: {
                    fontWeight: 'bold',
                    flex: 1,
                    textAlign: 'center',
                  },
                }}
              />
              <Stack1.Screen name="HomeDetails">
                {props => <HomeDetails {...props} extraData={someData} />}
              </Stack1.Screen>
            </Stack1.Navigator>)
          }
        </Tab.Screen>
        
        <Tab.Screen name="Projects">
          {
            () => (<Stack2.Navigator>
                <Stack2.Screen
                  name="Project"
                  component={Project}
                  options={{
                    title: 'My Project',
                    headerStyle: {
                      backgroundColor: '#ff9900',
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                      fontWeight: 'bold',
                      flex: 1,
                      textAlign: 'center',
                    },
                  }}
                />
              </Stack2.Navigator>
            )
          }
        </Tab.Screen>

        <Tab.Screen name="Users">
          {
            () => (<Stack3.Navigator>
                <Stack3.Screen
                  name="User"
                  component={User}
                  options={{
                    title: 'My User',
                    headerStyle: {
                      backgroundColor: '#ff3366',
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                      fontWeight: 'bold',
                      flex: 1,
                      textAlign: 'center',
                    },
                  }}
                />
              </Stack3.Navigator>
            )
          }
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
});

export default App;
