CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE users (
    id                    SERIAL PRIMARY KEY,
    username              VARCHAR(40)            UNIQUE NOT NULL,
    password              TEXT                   NOT NULL,
    email                 VARCHAR(254)           UNIQUE NOT NULL,
    last_session_time     TIMESTAMPTZ            NOT NULL,
    onboarding_complete   BOOL                   NOT NULL DEFAULT FALSE,

    name                  TEXT,
    birth_date            DATE,
    gender_displayed      TEXT,
    bio                   TEXT,
    location_point        GEOGRAPHY(POINT, 4326),
    location_approximate  TEXT,
	  public_contact_info	  TEXT,
	  profile_photo_url	    TEXT,
    gender_matched        TEXT CHECK (gender_matched IN ('MAN',
                                                         'NONBINARY',
                                                         'WOMAN')),

    show_age              BOOL,
    show_gender_displayed BOOL
);
COMMENT ON COLUMN users.last_session_time IS 'Updated on login or token authentication';
COMMENT ON COLUMN users.location_approximate IS 'Determined in app from location_point when location_point is updated';



CREATE TABLE global_hobby (
    name     TEXT PRIMARY KEY,
    category TEXT NOT NULL CHECK (category IN ('CREATIVE_ARTS',
                                               'COOKING',
                                               'EDUCATION',
                                               'ENGINEERING',
                                               'FITNESS',
                                               'GAMES',
                                               'MUSIC',
                                               'OUTDOORS',
                                               'READING',
                                               'SOCIAL',
                                               'SPORTS'
                                               --etc.
                                               ))
);
INSERT INTO global_hobby (name, category) VALUES
    --creative arts
    ('PAINTING', 'CREATIVE_ARTS'),
    ('DRAWING', 'CREATIVE_ARTS'),
    ('KNITTING', 'CREATIVE_ARTS'),
    ('WOODWORKING', 'CREATIVE_ARTS'),
    ('POTTERY', 'CREATIVE_ARTS'),
    ('WRITING', 'CREATIVE_ARTS'),
    ('PHOTOGRAPHY', 'CREATIVE_ARTS'),
    --cooking
    ('BAKING', 'COOKING'),
    ('GRILLING', 'COOKING'),
    ('MEAL_PREPPING', 'COOKING'),
    ('FERMENTING', 'COOKING'),
    ('CAKE_DECORATING', 'COOKING'),
    --education
    ('LANGUAGE_LEARNING', 'EDUCATION'),
    ('HISTORY', 'EDUCATION'),
    ('SCIENCE', 'EDUCATION'),
    ('MATHEMATICS', 'EDUCATION'),
    ('STUDY_GROUPS', 'EDUCATION'),
    ('RESEARCH', 'EDUCATION'),
    ('ESSAY_WRITING', 'EDUCATION'),
    --engineering
    ('PROGRAMMING', 'ENGINEERING'),
    ('ROBOTICS', 'ENGINEERING'),
    ('ELECTRONICS', 'ENGINEERING'),
    ('DIGITAL_FABRICATION', 'ENGINEERING'),
    ('MODEL_BUILDING', 'ENGINEERING'),
    --fitness
    ('RUNNING', 'FITNESS'),
    ('WEIGHTLIFTING', 'FITNESS'),
    ('YOGA', 'FITNESS'),
    ('CYCLING', 'FITNESS'),
    ('PILATES', 'FITNESS'),
    --games
    ('BOARD_GAMES', 'GAMES'),
    ('VIDEO_GAMES', 'GAMES'),
    ('CARD_GAMES', 'GAMES'),
    ('PUZZLES', 'GAMES'),
    ('ROLE_PLAYING_GAMES', 'GAMES'),
    --music
    ('GUITAR', 'MUSIC'),
    ('PIANO', 'MUSIC'),
    ('SINGING', 'MUSIC'),
    ('CONCERTS', 'MUSIC'),
    ('MUSIC_PRODUCTION', 'MUSIC'),
    --outdoors
    ('HIKING', 'OUTDOORS'),
    ('CAMPING', 'OUTDOORS'),
    ('FISHING', 'OUTDOORS'),
    ('GARDENING', 'OUTDOORS'),
    ('BIRD_WATCHING', 'OUTDOORS'),
    --reading
    ('READING_FICTION', 'READING'),
    ('READING_NONFICTION', 'READING'),
    ('READING_COMICS', 'READING'),
    ('READING_POETRY', 'READING'),
    ('AUDIOBOOKS', 'READING'),
    --social
    ('VOLUNTEERING', 'SOCIAL'),
    ('NETWORKING', 'SOCIAL'),
    ('DANCING', 'SOCIAL'),
    ('TRAVELING', 'SOCIAL'),
    ('MEETUPS', 'SOCIAL'),
    --sports
    ('SOCCER', 'SPORTS'),
    ('BASKETBALL', 'SPORTS'),
    ('TENNIS', 'SPORTS'),
    ('SWIMMING', 'SPORTS'),
    ('CRICKET', 'SPORTS')
;

CREATE TABLE hobby (
    id               SERIAL PRIMARY KEY,
    user_id          INT  NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    hobby_name       TEXT NOT NULL REFERENCES global_hobby (name),
    experience_level TEXT NOT NULL CHECK (experience_level IN ('BEGINNER',
                                                               'INTERMEDIATE',
                                                               'ADVANCED')),
    UNIQUE (user_id, hobby_name)
);
CREATE INDEX idx_hobby_hobby_name ON hobby (hobby_name);
CREATE INDEX idx_hobby_user ON hobby (user_id);

CREATE TABLE hobby_photo (
	id			      SERIAL PRIMARY KEY,
  hobby_id      INT  NOT NULL REFERENCES hobby(id) ON DELETE CASCADE,
	photo_url	    TEXT NOT NULL,
	caption		    TEXT
);



CREATE TABLE one_time_availability (
    id         SERIAL PRIMARY KEY,
    user_id    INT                    NOT NULL REFERENCES users (id) ON DELETE CASCADE,

    location   GEOGRAPHY(POINT, 4326) NOT NULL,

    start      TIMESTAMPTZ            NOT NULL,
    duration   INTERVAL               NOT NULL CHECK (duration > INTERVAL '0' AND duration < INTERVAL '1 week'),

    UNIQUE (user_id, start, duration)
);
CREATE INDEX idx_availability_user_date ON one_time_availability (user_id, start); --to find the current user's one-time availabilities
CREATE INDEX idx_availability_location ON one_time_availability USING GIST(location); --to find other users' one-time availabilities by location
CREATE INDEX idx_availability_date ON one_time_availability (start); --to find other users' one-time availabilities by time
COMMENT ON TABLE one_time_availability IS 'Overlapping active periods handled in application instead of by uniqueness constraints';

CREATE TABLE recurring_availability (
    id                 SERIAL PRIMARY KEY,
    user_id            INT                    NOT NULL REFERENCES users (id) ON DELETE CASCADE,

    location           GEOGRAPHY(POINT, 4326) NOT NULL,

    rule_start         DATE                   NOT NULL DEFAULT CURRENT_DATE,
    rule_end           DATE,
    frequency          TEXT                   NOT NULL CHECK (frequency IN ('WEEKLY',
                                                                            'EVERY_TWO_WEEKS',
                                                                            'MONTHLY')),
    start_day_of_week  TEXT CHECK (start_day_of_week IN ('MONDAY',
                                                         'TUESDAY',
                                                         'WEDNESDAY',
                                                         'THURSDAY',
                                                         'FRIDAY',
                                                         'SATURDAY',
                                                         'SUNDAY')),
    start_day_of_month INT CHECK (start_day_of_month BETWEEN 1 AND 31),
    start_time         TIME                   NOT NULL,
    duration           INTERVAL               NOT NULL CHECK (duration > INTERVAL '0' AND duration < INTERVAL '1 week'),
    time_zone_id       VARCHAR(64)            NOT NULL,

    CHECK (
           (frequency IN ('WEEKLY', 'EVERY_TWO_WEEKS') AND start_day_of_week IS NOT NULL AND start_day_of_month IS NULL)
           or
           (frequency = 'MONTHLY' AND start_day_of_month IS NOT NULL AND start_day_of_week IS NULL)
    ),
    CHECK (rule_end IS NULL OR rule_end >= rule_start)
);
CREATE INDEX idx_recurring_availability_user ON recurring_availability (user_id); --to find the current user's recurrence rules
CREATE INDEX idx_recurring_availability_location ON recurring_availability USING GIST(location); --to find other users' rules by location
CREATE INDEX idx_recurring_availability_active_period ON recurring_availability (rule_start, rule_end); --to find other users' rules by active period
COMMENT ON TABLE recurring_availability IS 'Overlapping active periods handled in application instead of by uniqueness constraints';
COMMENT ON COLUMN recurring_availability.rule_start IS 'Determines active weeks when frequency is "Every two weeks"';
COMMENT ON COLUMN recurring_availability.rule_end IS 'Nullable (may be active indefinitely)';
COMMENT ON COLUMN recurring_availability.time_zone_id IS 'IANA time zone ID';

CREATE TABLE availability_exception (
    id                  		  SERIAL PRIMARY KEY,
    user_id                   INT                     NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    recurring_availability_id	INT						          NOT NULL REFERENCES recurring_availability (id) ON DELETE CASCADE,
    exception_date      		  DATE					          NOT NULL,
	  exception_reason			    TEXT,

    is_cancelled        		  BOOLEAN					        NOT NULL,
    override_location   		  GEOGRAPHY(POINT, 4326),
    override_start_time 		  TIME,
    override_duration   		  INTERVAL                CHECK (override_duration > INTERVAL '0'
                                                             AND override_duration < INTERVAL '1 week'),

    CHECK (
           (is_cancelled = TRUE AND override_location IS NULL AND override_start_time IS NULL AND override_duration IS NULL)
           OR
           (is_cancelled = FALSE AND
           (override_location IS NOT NULL OR override_start_time IS NOT NULL OR override_duration IS NOT NULL))
    ),
    UNIQUE (recurring_availability_id, exception_date)
);



CREATE TABLE saved_match (
    id            SERIAL PRIMARY KEY,
    user_id       INT           NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    saved_user_id INT           NOT NULL REFERENCES users (id) ON DELETE CASCADE,
	  status		    TEXT          NOT NULL CHECK (status IN ('ACTIVE',
                                                           'DELETED')),
    hobby_name    TEXT          NOT NULL REFERENCES global_hobby (name),
    notes         TEXT,
    creation_time TIMESTAMPTZ   NOT NULL,
    CHECK (user_id <> saved_user_id),
    UNIQUE (user_id, saved_user_id, hobby_name)
);
CREATE INDEX idx_saved_match_user_hobby ON saved_match (user_id, hobby_name);
COMMENT ON COLUMN saved_match.status IS 'Used to restore recently deleted matches or to permanently delete matches after some time period';
