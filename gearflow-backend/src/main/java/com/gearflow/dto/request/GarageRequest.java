package com.gearflow.dto.request;

import lombok.Data;

@Data
public class GarageRequest {
    private String name;
    private String email;
    private String phone;
    private String address;
    private String city;
    private String state;
    private String logoUrl;
    private Long ownerId;
}

