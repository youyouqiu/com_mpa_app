package com.andproject;

/**
 * @description:
 * @author: zhengxiong.jiang
 * @createDate: 2022/5/20
 * @version: 1.0
 */
public class MessageDto {

    private Double latitude;
    private Double longitude;
    private Float direction;

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public Float getDirection() {
        return direction;
    }

    public void setDirection(Float direction) {
        this.direction = direction;
    }
}
