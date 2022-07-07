// ToastModule.java

package com.andproject;
import com.andproject.MyLocationListener;
import com.andproject.MessageDto;

import com.baidu.location.LocationClient;
import com.baidu.location.LocationClientOption;

import android.app.Activity;
import android.content.Intent;
import android.text.TextUtils;
import android.widget.Toast;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.JSApplicationIllegalArgumentException;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

import java.util.Map;
import java.util.ArrayList;
import java.util.HashMap;

public class ToastModule extends ReactContextBaseJavaModule implements ActivityEventListener {
    private static ReactApplicationContext reactContext;
  
    private static final String DURATION_SHORT_KEY = "SHORT";
    private static final String DURATION_LONG_KEY = "LONG";
    // private static final String DURATION_MESSAGE_KEY = "MESSAGE";
  
    public ToastModule(ReactApplicationContext context) {
      super(context);
      reactContext = context;
      onCreate();
    }

    public static LocationClient mLocationClient = null;

    private MyLocationListener myListener = new MyLocationListener();
    //BDAbstractLocationListener为7.2版本新增的Abstract类型的监听接口
    //原有BDLocationListener接口暂时同步保留。具体介绍请参考后文第四步的说明
    public void onCreate() {
        mLocationClient = new LocationClient(reactContext);
        //声明LocationClient类
        mLocationClient.registerLocationListener(myListener);
        //注册监听函数

        LocationClientOption option = new LocationClientOption();

        //        option.setLocationMode(LocationMode.Hight_Accuracy);
        //可选，设置定位模式，默认高精度
        //LocationMode.Hight_Accuracy：高精度；
        //LocationMode. Battery_Saving：低功耗；
        //LocationMode. Device_Sensors：仅使用设备；
        //LocationMode.Fuzzy_Locating, 模糊定位模式；v9.2.8版本开始支持，可以降低API的调用频率，但同时也会降低定位精度；

        option.setCoorType("bd09ll");
        //可选，设置返回经纬度坐标类型，默认GCJ02
        //GCJ02：国测局坐标；
        //BD09ll：百度经纬度坐标；
        //BD09：百度墨卡托坐标；
        //海外地区定位，无需设置坐标类型，统一返回WGS84类型坐标

        //        option.setFirstLocType(FirstLocTypefirstLocType)
        //可选，首次定位时可以选择定位的返回是准确性优先还是速度优先，默认为速度优先
        //可以搭配setOnceLocation(Boolean isOnceLocation)单次定位接口使用，当设置为单次定位时，setFirstLocType接口中设置的类型即为单次定位使用的类型
        //FirstLocType.SPEED_IN_FIRST_LOC:速度优先，首次定位时会降低定位准确性，提升定位速度；
        //FirstLocType.ACCUARACY_IN_FIRST_LOC:准确性优先，首次定位时会降低速度，提升定位准确性；

        option.setScanSpan(1000);
        //可选，设置发起定位请求的间隔，int类型，单位ms
        //如果设置为0，则代表单次定位，即仅定位一次，默认为0
        //如果设置非0，需设置1000ms以上才有效

        option.setOpenGps(true);
        //可选，设置是否使用gps，默认false
        //使用高精度和仅用设备两种定位模式的，参数必须设置为true

        option.setLocationNotify(true);
        //可选，设置是否当GPS有效时按照1S/1次频率输出GPS结果，默认false

        option.setIgnoreKillProcess(false);
        //可选，定位SDK内部是一个service，并放到了独立进程。
        //设置是否在stop的时候杀死这个进程，默认（建议）不杀死，即setIgnoreKillProcess(true)

        option.SetIgnoreCacheException(false);
        //可选，设置是否收集Crash信息，默认收集，即参数为false

        option.setWifiCacheTimeOut(5*60*1000);
        //可选，V7.2版本新增能力
        //如果设置了该接口，首次启动定位时，会先判断当前Wi-Fi是否超出有效期，若超出有效期，会先重新扫描Wi-Fi，然后定位

        option.setEnableSimulateGps(false);
        //可选，设置是否需要过滤GPS仿真结果，默认需要，即参数为false

        option.setNeedNewVersionRgc(true);
        //可选，设置是否需要最新版本的地址信息。默认需要，即参数为true

        mLocationClient.setLocOption(option);
        //mLocationClient为第二步初始化过的LocationClient对象
        //需将配置好的LocationClientOption对象，通过setLocOption方法传递给LocationClient对象使用
        //更多LocationClientOption的配置，请参照类参考中LocationClientOption类的详细说明
    }

    // 返回模块名字，方便在RN中引用
    @Override
    public String getName() {
      return "ToastModule";
    }

    @Override
    public Map<String, Object> getConstants() {
        // 让js那边能够使用这些常量
        // me.setLatitude(latitude);
        // me.setLongitude(longitude);
        final Map<String, Object> constants = new HashMap<>();
        constants.put(DURATION_SHORT_KEY, Toast.LENGTH_SHORT);
        constants.put(DURATION_LONG_KEY, Toast.LENGTH_LONG);
        return constants;
    }

//    private void sendEvent(ReactApplicationContext reactContext, String eventName, String params) {
//        reactContext
//            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
//            .emit(eventName, params);
//    }

    // 用ReactNative注解，标示此方法是可以被RN调用的
    @ReactMethod
    public void show(String message, int duration) {
      Toast.makeText(getReactApplicationContext(), message, duration).show();
    }

    // 用ReactNative注解，标示此方法是可以被RN调用的
    @ReactMethod
    public void jumpActivity(String name, String params) {
      try {
          Activity currentActivity = getCurrentActivity();
          if (null != currentActivity) {
              Class toActivity = Class.forName(name);
              Intent intent = new Intent(currentActivity, toActivity);
              intent.putExtra("params", params);
              currentActivity.startActivity(intent);
          }
      } catch (Exception e) {
          throw new JSApplicationIllegalArgumentException(
                  "不能打开Activity : " + e.getMessage());
      }
    }

     private static MessageDto messageData = null;

    // 用ReactNative注解，标示此方法是可以被RN调用的（开启百度定位）
    @ReactMethod
    public void startDataToJS(Callback successBack, Callback errorBack) {
        try {
            mLocationClient.start();
            // Activity currentActivity = getCurrentActivity();
            // String result = currentActivity.getIntent().getStringExtra("data");
            // if (TextUtils.isEmpty(result)) {
            //     result = "没有数据";
            // }

            // successBack.invoke(result);
        } catch (Exception e) {
            errorBack.invoke(e.getMessage());
        }
    }
    
    // 获取百度经纬度数据
    public static void dataCallBack(MessageDto me, int errorCode) {
        messageData = me;
        // mLocationClient.stop();
        // Toast.makeText(getReactApplicationContext(), errorCode).show();
        // sendEvent(reactContext, "onScanningResult", "111");
    }

    // 用ReactNative注解，标示此方法是可以被RN调用的（停止百度定位）
    @ReactMethod
    public void stopDataToJS(Callback successBack, Callback errorBack) {
        try {
            mLocationClient.stop();
            // Activity currentActivity = getCurrentActivity();
            // String result = currentActivity.getIntent().getStringExtra("data");
            // if (TextUtils.isEmpty(result)) {
            //     result = "没有数据";
            // }

            // successBack.invoke(result);
        } catch (Exception e) {
            errorBack.invoke(e.getMessage());
        }
    }

    // 用ReactNative注解，标示此方法是可以被RN调用的（纬度）
    @ReactMethod
    public void dataToRNLat(Callback successBack, Callback errorBack) {
        try {
            // List<MessageDto> list = new ArrayList<>();
            // list.add(messageData);
            // MessageDto[] me = new MessageDto[]{messageData};
            Double strDouble = messageData.getLatitude();
            String result = String.valueOf(strDouble);
            if (TextUtils.isEmpty(result)) {
                result = "没有数据";
            }
            successBack.invoke(result);
        } catch (Exception e) {
            errorBack.invoke(e.getMessage());
        }
    }

    // 用ReactNative注解，标示此方法是可以被RN调用的（经度）
    @ReactMethod
    public void dataToRNLong(Callback successBack, Callback errorBack) {
        try {
            // List<MessageDto> list = new ArrayList<>();
            // list.add(messageData);
            // MessageDto[] me = new MessageDto[]{messageData};
            Double strDouble = messageData.getLongitude();
            String result = String.valueOf(strDouble);
            if (TextUtils.isEmpty(result)) {
                result = "没有数据";
            }
            successBack.invoke(result);
        } catch (Exception e) {
            errorBack.invoke(e.getMessage());
        }
    }

    // 这两个方法是ActivityEventListener接口中的，方便处理一些由此模块跳转后返回的回调事件
    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {

    }

    @Override
    public void onNewIntent(Intent intent) {

    }
}
