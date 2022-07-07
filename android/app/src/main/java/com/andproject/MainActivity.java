package com.andproject;

import com.facebook.react.ReactActivity;

import android.os.Bundle;
import android.Manifest;
import android.content.pm.PackageManager;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.annotation.NonNull;

import java.util.ArrayList;
import java.util.List;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "ANDProject";
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    checkPermission();
    super.onCreate(null);
  }

  //需要的权限集合
  String[] permissions = new String[]{
    Manifest.permission.ACCESS_COARSE_LOCATION,
    Manifest.permission.ACCESS_FINE_LOCATION,
    Manifest.permission.ACCESS_WIFI_STATE,
    Manifest.permission.ACCESS_NETWORK_STATE,
    Manifest.permission.CHANGE_WIFI_STATE,
    Manifest.permission.WRITE_EXTERNAL_STORAGE,
    Manifest.permission.INTERNET,
  };
  List<String> mPermissionList = new ArrayList<>();

  private static final int PERMISSION_REQUEST = 1;
  //检查权限
  private void checkPermission() {
    mPermissionList.clear();
    //判断哪些权限未授予
    for (int i = 0; i < permissions.length; i++) {
      if (ContextCompat.checkSelfPermission(this, permissions[i]) != PackageManager.PERMISSION_GRANTED) {
        mPermissionList.add(permissions[i]);
      }
    }
    /**
     * 判断是否为空
     */
    if (mPermissionList.isEmpty()) {//未授予的权限为空，表示都授予了
    } else {//请求权限方法
      String[] permissions = mPermissionList.toArray(new String[mPermissionList.size()]);//将List转为数组
      ActivityCompat.requestPermissions(MainActivity.this, permissions, PERMISSION_REQUEST);
    }
  }

  /**
   * 响应授权
   * 这里不管用户是否拒绝，都进入首页，不再重复申请权限
   */
  @Override
  public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
    super.onRequestPermissionsResult(requestCode, permissions, grantResults);
    switch (requestCode) {
      case PERMISSION_REQUEST:
        break;
      default:
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        break;
    }
  }
}
