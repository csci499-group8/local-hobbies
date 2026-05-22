package io.github.csci499_group8.local_hobbies.backend.service;

import com.google.maps.GeoApiContext;
import com.google.maps.GeocodingApi;
import com.google.maps.model.AddressComponentType;
import com.google.maps.model.GeocodingResult;
import com.google.maps.model.LatLng;
import io.github.csci499_group8.local_hobbies.backend.dto.common.GeoJsonPoint;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.iakovlev.timeshape.TimeZoneEngine;
import org.locationtech.jts.geom.Point;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.util.Arrays;

@Slf4j
@Service
@RequiredArgsConstructor
public class LocationService {

    private final GeoApiContext geoApiContext;

    //for Render free tier, which has only 512MB of RAM:
    //only load timezone data for the contiguous US instead of the entire world
    TimeZoneEngine TIME_ZONE_ENGINE = TimeZoneEngine.initialize(24.0, -125.0, 50.0, -66.0, false);

//    private static final TimeZoneEngine TIME_ZONE_ENGINE = TimeZoneEngine.initialize();

    public String getCityFromGeoJsonPoint(GeoJsonPoint point) {
        if (point == null || point.coordinates().size() < 2) {
            return "Unknown location";
        }

        //GeoJSON is [longitude, latitude], Google Maps is (latitude, longitude)
        double lon = point.coordinates().get(0);
        double lat = point.coordinates().get(1);
        LatLng latLng = new LatLng(lat, lon);

        try {
            GeocodingResult[] results = GeocodingApi.reverseGeocode(geoApiContext, latLng).await();

            if (results != null && results.length > 0) {
                //address's city is usually under the type "LOCALITY"
                return Arrays.stream(results[0].addressComponents)
                             .filter(c -> Arrays.asList(c.types).contains(AddressComponentType.LOCALITY))
                             .map(c -> c.longName)
                             .findFirst()
                             .orElse("Unknown location");
            }
        } catch (Exception e) {
            log.error("Reverse geocoding failed for coordinates [{}, {}]: {}", lat, lon, e.getMessage());
            return "Unknown location";
        }

        return "Unknown location";
    }

    public ZoneId getTimeZoneOfGeoJsonPoint(GeoJsonPoint point) {
        double longitude = point.coordinates().get(0);
        double latitude = point.coordinates().get(1);
        return TIME_ZONE_ENGINE.query(latitude, longitude) //may return empty for disputed time zones
                               .orElse(ZoneId.of("UTC"));
    }

    public ZoneId getTimeZoneOfPoint(Point location) {
        //X = longitude, Y = latitude
        return TIME_ZONE_ENGINE.query(location.getY(), location.getX())
                               .orElse(ZoneId.of("UTC")); //may return empty for disputed time zones
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
