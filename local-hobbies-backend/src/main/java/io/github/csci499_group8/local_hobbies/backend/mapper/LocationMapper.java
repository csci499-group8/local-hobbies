package io.github.csci499_group8.local_hobbies.backend.mapper;

import io.github.csci499_group8.local_hobbies.backend.dto.common.GeoJsonPoint;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.mapstruct.Mapper;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

@Mapper(componentModel = "spring",
        imports = { Coordinate.class, GeoJsonPoint.class },
        uses = { JsonNullableMapper.class })
public abstract class LocationMapper {

    @Autowired
    protected GeometryFactory geometryFactory;

    public Point mapGeoJsonPointToPoint(GeoJsonPoint point) {
        if (point == null) return null;
        return geometryFactory.createPoint(new Coordinate(point.coordinates().get(0),
                                                          point.coordinates().get(1)));
    }

    public GeoJsonPoint mapPointToGeoJsonPoint(Point point) {
        if (point == null) return null;
        return new GeoJsonPoint(GeoJsonPoint.GeometryType.Point,
                                List.of(point.getX(), point.getY()));
    }

}
