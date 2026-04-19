package io.github.csci499_group8.local_hobbies.backend.config;

public class AvailabilityConstants {

    /**
     * Time window within which an availability can be scheduled; also time window
     * within which recurring availabilities are projected to intervals
     */
    public static final int SCHEDULING_WINDOW_DAYS = 180;

    /**
     * Time window within which users' schedules are compared
     */
    public static final int OVERLAP_WINDOW_DAYS = 30;

    /**
     * Maximum duration of an availability
     */
    public static final long MAX_DURATION_HOURS = 168;

}
