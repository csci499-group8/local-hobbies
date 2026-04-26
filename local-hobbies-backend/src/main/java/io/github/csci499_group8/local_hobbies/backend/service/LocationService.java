package io.github.csci499_group8.local_hobbies.backend.service;

import io.github.csci499_group8.local_hobbies.backend.dto.common.GeoJsonPoint;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Point;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LocationService {

    //TODO: implement geocoding API
    public String getCityFromGeoJsonPoint(GeoJsonPoint point) {
        return "todo-approximate-location";
    }

    //Haversine formula to calculate distance from coordinates
    //returns distance to the nearest tenth of a kilometer
    public static double calculateDistanceKilometers(Point p1, Point p2) {
        double lat1 = p1.getY();
        double lon1 = p1.getX();
        double lat2 = p2.getY();
        double lon2 = p2.getX();

        double earthRadiusKilometers = 6371;
        double deltaLat = Math.toRadians(lat2 - lat1);
        double deltaLon = Math.toRadians(lon2 - lon1);

        //a = square of half the straight-line distance between p1 and p2
        double a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

        //c = angular distance
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return Math.round((earthRadiusKilometers * c) * 10.0) / 10.0;
    }

}
