
module.exports =
  jettyG3EEPROM:
    VERSION_LOW:                    0x0000
    VERSION_HIGH:                   0x0001
    AXIS_INVERSION:                 0x0002
    ENDSTOP_INVERSION:              0x0003
    MACHINE_NAME:                   0x0020
    AXIS_HOME_POSITIONS:            0x0060
    ESTOP_CONFIGURATION:            0x0074
    TOOL0_TEMP:                     0x0080
    TOOL1_TEMP:                     0x0081
    PLATFORM_TEMP:                  0x0082
    EXTRUDE_DURATION:               0x0083
    EXTRUDE_MMS:                    0x0084
    MOOD_LIGHT_SCRIPT:              0x0085
    MOOD_LIGHT_CUSTOM_RED:          0x0086
    MOOD_LIGHT_CUSTOM_GREEN:        0x0087
    MOOD_LIGHT_CUSTOM_BLUE:         0x0088
    JOG_MODE_SETTINGS:              0x0089
    BUZZER_REPEATS:                 0x008A
    STEPS_PER_MM_X:                 0x008B
    STEPS_PER_MM_Y:                 0x0093
    STEPS_PER_MM_Z:                 0x009B
    STEPS_PER_MM_A:                 0x00A3
    STEPS_PER_MM_B:                 0x00AB
    FILAMENT_USED:                  0x00B3
    FILAMENT_USED_TRIP:             0x00BB
    ABP_COPIES:                     0x00C3
    PREHEAT_DURING_ESTIMATE:        0x00C4
    OVERRIDE_GCODE_TEMP:            0x00C5
    STEPPER_DRIVER:                 0x0126
    ACCEL_MAX_FEEDRATE_X:           0x0127
    ACCEL_MAX_FEEDRATE_Y:           0x012B
    ACCEL_MAX_FEEDRATE_Z:           0x012F
    ACCEL_MAX_FEEDRATE_A:           0x0133
    ACCEL_MAX_FEEDRATE_B:           0x0137
    ACCEL_MAX_ACCELERATION_X:       0x013B
    ACCEL_MAX_ACCELERATION_Y:       0x013F
    ACCEL_MAX_ACCELERATION_Z:       0x0143
    ACCEL_MAX_ACCELERATION_A:       0x0147
    ACCEL_MAX_EXTRUDER_NORM:        0x014B
    ACCEL_MAX_EXTRUDER_RETRACT:     0x014F
    ACCEL_E_STEPS_PER_MM:           0x0153
    ACCEL_MIN_FEED_RATE:            0x0157
    ACCEL_MIN_TRAVEL_FEED_RATE:     0x015B
    ACCEL_ADVANCE_K2:               0x015F
    ACCEL_MIN_PLANNER_SPEED:        0x0163
    ACCEL_ADVANCE_K:                0x0167
    ACCEL_NOODLE_DIAMETER:          0x016B
    ACCEL_MIN_SEGMENT_TIME:         0x016F
    LCD_TYPE:                       0x0173
    ENDSTOPS_USED:                  0x0174
    HOMING_FEED_RATE_X:             0x0175
    HOMING_FEED_RATE_Y:             0x0179
    HOMING_FEED_RATE_Z:             0x017D
    ACCEL_REV_MAX_FEED_RATE:        0x0181
    ACCEL_EXTRUDER_DEPRIME:         0x0185
    ACCEL_SLOWDOWN_LIMIT:           0x0189
    ACCEL_CLOCKWISE_EXTRUDER:       0x018D
    INVERTED_EXTRUDER_5D:           0x0191
    ACCEL_MAX_SPEED_CHANGE_X:       0x0192
    ACCEL_MAX_SPEED_CHANGE_Y:       0x0196
    ACCEL_MAX_SPEED_CHANGE_Z:       0x019A
    ACCEL_MAX_SPEED_CHANGE_A:       0x019E
    RAM_USAGE_DEBUG:                0x01D0


  sailfishEEPROM:
    SLOWDOWN_FLAG:                  0x0189
    ACCEL_MAX_SPEED_CHANGE_B:       0x01A2
    ACCEL_MAX_ACCELERATION_B:       0x01A6
    ACCEL_EXTRUDER_DEPRIME_B:       0x01AA
    TOOL_COUNT:                     0x01AE
    TOOLHEAD_OFFSET_SETTINGS:       0x01B0
    AXIS_LENGTHS:                   0x01BC
    FILAMENT_LIFETIME_B:            0x01D4
    DITTO_PRINT_ENABLED:            0x01DC
    VID_PID_INFO:                   0x01E5
    EXTRUDER_HOLD:                  0x01E9


  jettyMBEEPROM:
    ACCELERATION_STATE:             0x023E
    BOT_STATUS_BYTES:               0x018A
    AXIS_LENGTHS:                   0x018C
    AXIS_STEPS_PER_MM:              0x01A0
    FILAMENT_LIFETIME:              0x01B4
    FILAMENT_TRIP:                  0x01C4
    PROFILES_BASE:                  0x01D5
    PROFILES_INIT:                  0x023D
    MAX_ACCELERATION_AXIS:          0x0240
    MAX_ACCELERATION_NORMAL_MOVE:   0x024A
    MAX_ACCELERATION_EXTRUDER_MOVE: 0x024C
    MAX_SPEED_CHANGE:               0x024E
    JKN_ADVANCE_K:                  0x0258
    JKN_ADVANCE_K2:                 0x025C
    EXTRUDER_DEPRIME_STEPS:         0x0260
    SLOWDOWN_FLAG:                  0x0264
    DEFAULTS_FLAG:                  0x0265
    FUTURE_USE:                     0x0266
    AXIS_MAX_FEEDRATES:             0x027A
    OVERRIDE_GCODE_TEMP:            0x0FFD
    HEAT_DURING_PAUSE:              0x0FFE


# TODO: Import Mightyboard EEPROM Lookup Tables from ReplicatorG.

# /// EEPROM offsets for PID electronics control
# final class ExtruderPIDTermOffsets implements EEPROMClass {
#         final static int P_TERM_OFFSET = ToolheadEEPROM.EXTRUDER_PID_BASE + 0x0000;
#         final static int I_TERM_OFFSET = ToolheadEEPROM.EXTRUDER_PID_BASE + 0x0002;
#         final static int D_TERM_OFFSET = ToolheadEEPROM.EXTRUDER_PID_BASE + 0x0004;
# };


# /// EEPROM offset class for toolhead info/data
# class ToolheadEEPROM implements EEPROMClass
# {
#         ////Feature map: 2 bytes
#         public static final int FEATURES                                = 0x0000;
#         /// Backoff stop time, in ms: 2 bytes
#         public static final int BACKOFF_STOP_TIME         = 0x0002;
#         /// Backoff reverse time, in ms: 2 bytes
#         public static final int BACKOFF_REVERSE_TIME      = 0x0004;
#         /// Backoff forward time, in ms: 2 bytes
#         public static final int BACKOFF_FORWARD_TIME      = 0x0006;
#         /// Backoff trigger time, in ms: 2 bytes
#         public static final int BACKOFF_TRIGGER_TIME      = 0x0008;
#         /// Extruder heater base location: 6 bytes
#         public static final int EXTRUDER_PID_BASE         = 0x000A;
#         /// HBP heater base location: 6 bytes data
#         public static final int HBP_PID_BASE              = 0x0010;
#         /// Extra features word: 2 bytes
#         public static final int EXTRA_FEATURES            = 0x0016;
#         /// Extruder identifier; defaults to 0: 1 byte 
#         /// Padding: 1 byte of space
#         public static final int SLAVE_ID                  = 0x0018;
#         /// Cooling fan info: 2 bytes 
#         public static final int COOLING_FAN_SETTINGS         = 0x001A;
#         /// Padding: 6 empty bytes of space
        
#         // TOTAL MEMORY SIZE PER TOOLHEAD = 28 bytes
# }


# class MightyBoard5XEEPROM implements EEPROMClass
# {
#         /// EEPROM for Mightyboard in the 4.x and 5.x firmware version
#         /// NOTE: this file needs to match the data in EepromMap.hh for all 
#         /// version of firmware for the specified machine. IE, all MightyBoard firmware
#         /// must be compatible with this eeprom map. 
        
        
#         /// Misc info values
#         public static final int EEPROM_CHECK_LOW = 0x5A;
#         public static final int EEPROM_CHECK_HIGH = 0x78;
        
#         public static final int MAX_MACHINE_NAME_LEN = 16; // set to 32 in firmware
        
#         final static class ECThermistorOffsets {
        
#     final public static int R0 = 0x00;
#     final public static int T0 = 0x04;
#     final public static int BETA = 0x08;
#     final public static int DATA = 0x10;
    
#     public static int r0(int which) { return R0 + THERM_TABLE; }
#     public static int t0(int which) { return T0 + THERM_TABLE; }
#     public static int beta(int which) { return BETA + THERM_TABLE; }
#     public static int data(int which) { return DATA + THERM_TABLE; }
#         };
        
#   final static class AccelerationOffsets {
        
#                 final public static int Active = 0x00;
#                 final public static int Rate = 0x02;
#                 final public static int AxisRate = 0x04;
#                 final public static int AxisJerk = 0x0E;
#     final public static int MinimumSpeed = 0x18;
#     final public static int DefaultsFlag = 0x1A;

#         };
        
        
        
#         /// Version, low byte: 1 byte
#         final public static int VERSION_LOW                                = 0x0000;
#         /// Version, high byte: 1 byte
#         final public static int VERSION_HIGH                                = 0x0001;
#         /// Axis inversion flags: 1 byte.
#         /// Axis N (where X=0, Y=1, etc.) is inverted if the Nth bit is set.
#         /// Bit 7 is used for HoldZ OFF: 1 = off, 0 = on
#         final public static int AXIS_INVERSION                        = 0x0002;
#         /// Endstop inversion flags: 1 byte.
#         /// The endstops for axis N (where X=0, Y=1, etc.) are considered
#         /// to be logically inverted if the Nth bit is set.
#         /// Bit 7 is set to indicate endstops are present; it is zero to indicate
#         /// that endstops are not present.
#         /// Ordinary endstops (H21LOB et. al.) are inverted.
#         /// only valid values are 0x9F, 0x80 or 0x00
#         final public static int ENDSTOP_INVERSION                        = 0x0004;
#         /// Digital Potentiometer Settings : 5 Bytes
#         final public static int DIGI_POT_SETTINGS                        = 0x0006;
#         /// axis home direction (1 byte)
#         final public static int AXIS_HOME_DIRECTION = 0x000C;
#         /// Default locations for the axis in step counts: 5 x 32 bit = 20 bytes
#         final public static int AXIS_HOME_POSITIONS                = 0x000E;
#         /// Name of this machine: 32 bytes.
#         final public static int MACHINE_NAME                        = 0x0022;
#         /// Tool count : 2 bytes
#         final public static int TOOL_COUNT                                 = 0x0042;
#         /// Hardware ID. Must exactly match the USB VendorId/ProductId pair: 4Bytes 
#         final public static int VID_PID_INFO                        = 0x0044; 
#   /// Version number to be tagged with Git Commit
#   //  two bytes
#   final public static int INTERNAL_VERSION        = 0X0048;
#   /// Git Commit number
#   //  two bytes
#   final public static int COMMIT_VERSION          = 0X004A;
#   /// Boolean if HBP exists
#   //  two bytes
#   final public static int HBP_PRESENT             = 0X004C;
#   /// 38 bytes padding
#         /// Thermistor table 0: 128 bytes
#         final public static int THERM_TABLE                                = 0x0074;
#         /// Padding: 8 bytes
#         // Toolhead 0 data: 26 bytes (see above)
#         final public static int T0_DATA_BASE                        = 0x0100;
#         // Toolhead 0 data: 26 bytes (see above)
#         final public static int T1_DATA_BASE                        = 0x011C;
#         /// 2 bytes padding
#         /// Light Effect table. 3 Bytes x 3 entries
#         final public static int LED_STRIP_SETTINGS                = 0x0140;
#         /// Buzz Effect table. 4 Bytes x 3 entries
#         /// 1 byte padding for offsets
#         final public static int BUZZ_SETTINGS                = 0x014A;
#         ///  1 byte. 0x01 for 'never booted before' 0x00 for 'have been booted before)
#         final public static int FIRST_BOOT_FLAG        = 0x0156;
#   /// 7 bytes, short int x 3 entries, 1 byte on/off
#   final public static int PREHEAT_SETTINGS = 0x0158;
#   /// 1 byte,  0x01 for help menus on, 0x00 for off
#   final public static int FILAMENT_HELP_SETTINGS = 0x0160;
#   /// This indicates how far out of tolerance the toolhead0 toolhead1 distance is
#   /// in steps.  3 x 32 bits = 12 bytes
#   final public static int TOOLHEAD_OFFSET_SETTINGS = 0x0162;
#   /// Acceleraton settings 1byte + 2 bytes
#   final public static int ACCELERATION_SETTINGS = 0x016E;
#   /// Last know bot status, 
#   /// 2 bytes
#   final public static int BOT_STATUS_BYTE                                = 0x018A;
#   /// axis lengths XYZ AB 5*32bit = 20 bytes 
#   final public static int AXIS_LENGTHS                     = 0x018C; 
#   /// Estimated lifetime print hours, 3bytes
#   final public static int TOTAL_BUILD_TIME                        = 0x01A0;
#   /// start of free space
#   final public static int FREE_EEPROM_STARTS = 0x01A4;
# }



# class MightyBoard6X2EEPROM extends MightyBoard5XEEPROM
# {
#         /// EEPROM for Mightyboard in the 6.1+ firmware version with Jetty Acceleration
#         /// NOTE: this file needs to match the data in EepromMap.hh for all 

#         final public static int ACCELERATION_STATE             = 0x016E;
#         final public static int AXIS_STEPS_PER_MM              = 0x01A4;
#         final public static int FILAMENT_LIFETIME              = 0x01B8;
#         final public static int FILAMENT_TRIP                  = 0x01C8;
#         final public static int MAX_ACCELERATION_AXIS          = 0x016E+0x04;
#         final public static int MAX_ACCELERATION_NORMAL_MOVE   = 0x016E+0x02;
#         final public static int MAX_ACCELERATION_EXTRUDER_MOVE = 0x016E+0x18;
#         final public static int MAX_SPEED_CHANGE               = 0x016E+0x0E;
#         final public static int JKN_ADVANCE_K                  = 0x01D8;
#         final public static int JKN_ADVANCE_K2                 = 0x01D8+0x04;
#         final public static int EXTRUDER_DEPRIME_STEPS         = 0x01D8+0x08;
#         final public static int SLOWDOWN_FLAG                  = 0x01D8+0x0C;
#         final public static int DEFAULTS_FLAG                  = 0x016E+0x1A;
#         final public static int FUTURE_USE                     = 0x01D8+0x0E;
#         final public static int AXIS_MAX_FEEDRATES             = 0x01F4;
#   /// Hardware configuration settings 
#   final public static int BOTSTEP_TYPE                              = 0x0208;
#   /// Heater calibration byte
#   final public static int HEATER_CALIBRATION      = 0x020A;
#   final public static int AXIS_LENGTHS_MM         = 0x0210;
#   final public static int AXIS_HOME_POSITIONS_MM   = 0x0224;
      
#   /// start of free space
#   final public static int FREE_EEPROM_STARTS                        = 0x0238;

# }