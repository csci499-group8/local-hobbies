CREATE TABLE users (
    id                    SERIAL PRIMARY KEY,
    username              VARCHAR(40) UNIQUE  NOT NULL,
    password              TEXT                NOT NULL,
    email                 VARCHAR(254) UNIQUE NOT NULL,
    when_last_active      TIMESTAMPTZ         NOT NULL,

    name                  TEXT                NOT NULL,
    birth_date            DATE                NOT NULL,
    gender_displayed      TEXT,
    gender_matched        TEXT CHECK (gender_matched IN (
                                                         'Woman',
                                                         'Man',
                                                         'Nonbinary',
                                                         'Prefer not to specify'
                                                        )),
    bio                   TEXT,
    location_point        GEOGRAPHY(POINT, 4326) NOT NULL,
    location_general      TEXT                NOT NULL,

    show_age              BOOL DEFAULT TRUE,
    show_gender_displayed BOOL DEFAULT TRUE
);
COMMENT ON COLUMN when_last_active IS 'Updated on login or token authentication';
COMMENT ON COLUMN location_general IS 'Determined in app from location_point when location_point is updated';



CREATE TABLE hobby_type (
    name     TEXT PRIMARY KEY,
    category TEXT CHECK (category IN (
                                      'Arts and Crafts',
                                      'Cooking',
                                      'Education',
                                      'Fitness',
                                      'Games',
                                      'Music',
                                      'Reading',
                                      'Social',
                                      'Sports',
                                      'Technology',
                                      --etc.
                                     ))
);
COMMENT ON TABLE hobby_type IS 'Table required to keep hobbies in hobby table and saved_match table in sync';
INSERT INTO hobby_type(name, category) VALUES (
                                               ('Studying', 'Education'),
                                               ('Language immersion', 'Education'),
                                               ('Painting', 'Arts and Crafts'),
                                               ('Concerts', 'Music'),
                                               ('Hiking', 'Fitness'),
                                               ('Yoga', 'Fitness'),
                                               --etc.
                                              );

CREATE TABLE hobby (
    id               SERIAL PRIMARY KEY,
    user_id          INT  NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    hobby_name       TEXT NOT NULL REFERENCES hobby_type (name),
    experience_level TEXT CHECK (experience_level IN (
                                                      'Beginner',
                                                      'Intermediate',
                                                      'Advanced'
                                                     )),
    UNIQUE (user_id, hobby_name)
);
CREATE INDEX idx_hobby_hobby_name ON hobby (hobby_name);



CREATE TABLE availability (
    id         SERIAL PRIMARY KEY,
    user_id    INT  NOT NULL REFERENCES users (id) ON DELETE CASCADE,

    location   GEOGRAPHY(POINT, 4326) NOT NULL,

    start_date DATE NOT NULL,
    start_time TIME NOT NULL,
    duration INTERVAL NOT NULL CHECK (duration > INTERVAL '0' AND duration < INTERVAL '1 week'),

    UNIQUE (user_id, start_date, start_time, duration)
)
CREATE INDEX idx_availability_user_date ON availability (user_id, start_date); --to find the current user's one-time availabilities
CREATE INDEX idx_availability_location ON availability USING GIST(location); --to find other users' one-time availabilities by location
CREATE INDEX idx_availability_date ON availability (start_date); --to find other users' one-time availabilities by date
COMMENT ON TABLE recurring_availability IS 'Overlapping active periods handled in application instead of by uniqueness constraints';

CREATE TABLE availability_recurrence_rule (
    id                 SERIAL PRIMARY KEY,
    user_id            INT  NOT NULL REFERENCES users (id) ON DELETE CASCADE,

    location           GEOGRAPHY(POINT, 4326) NOT NULL,

    rule_start         DATE NOT NULL DEFAULT CURRENT DATE,
    rule_end           DATE,
    frequency          TEXT NOT NULL CHECK (frequency IN (
                                                          'Weekly',
                                                          'Every two weeks',
                                                          'Monthly'
                                                         )),
    start_day_of_week  INT CHECK (start_day_of_week BETWEEN 0 AND 6),
    start_day_of_month INT CHECK (start_day_of_month BETWEEN 1 AND 31),
    start_time         TIME NOT NULL,
    duration INTERVAL NOT NULL CHECK (duration > INTERVAL '0' AND duration < INTERVAL '1 week'),

    CHECK (
        (frequency IN ('Weekly', 'Every two weeks') AND start_day_of_week IS NOT NULL AND start_day_of_month IS NULL)
            or
        (frequency = 'Monthly' AND start_day_of_month IS NOT NULL AND start_day_of_week IS NULL)
        ),
    CHECK (rule_end IS NULL OR rule_end >= rule_start),
);
CREATE INDEX idx_recurrence_user ON availability_recurrence_rule (user_id); --to find the current user's recurrence rules
CREATE INDEX idx_recurrence_location ON availability_recurrence_rule USING GIST(location); --to find other users' rules by location
CREATE INDEX idx_recurrence_active_period ON availability_recurrence_rule (rule_start, rule_end); --to find other users' rules by active period
COMMENT ON TABLE recurring_availability IS 'Overlapping active periods handled in application instead of by uniqueness constraints';
COMMENT ON COLUMN rule_start IS 'Determines active weeks when frequency is "Every two weeks"';
COMMENT ON COLUMN rule_end IS 'Nullable (may be active indefinitely)';

CREATE TABLE availability_exception (
    id                  SERIAL PRIMARY KEY,
    recurrence_rule_id  INT  NOT NULL REFERENCES availability_recurrence_rule (id) ON DELETE CASCADE,
    exception_date      DATE NOT NULL,

    is_cancelled        BOOLEAN DEFAULT FALSE,
    override_location   GEOGRAPHY(POINT, 4326),
    override_start_time TIME,
    override_duration INTERVAL,

    CHECK (
        (is_cancelled = TRUE AND override_location IS NULL AND override_start_time IS NULL AND
         override_duration IS NULL)
            OR
        (is_cancelled = FALSE AND
         (override_location IS NOT NULL OR override_start_time IS NOT NULL OR override_duration IS NOT NULL))
        ),
    UNIQUE (recurrence_rule_id, exception_date)
);



CREATE TABLE saved_match (
    id            SERIAL PRIMARY KEY,
    user_id       INT  NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    saved_user_id INT  NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    hobby_name    TEXT NOT NULL REFERENCES hobby_type (name),
    save_date     TIMESTAMPTZ,
    notes         TEXT,
    CHECK (user_id <> saved_user_id),
    UNIQUE (user_id, saved_user_id, hobby_name)
);
CREATE INDEX idx_saved_match_user_hobby ON saved_match (user_id, hobby_name);