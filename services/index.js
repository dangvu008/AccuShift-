// Import all services
import * as WeatherService from "./WeatherService"
import * as ShiftService from "./ShiftService"
import * as WorkLogService from "./WorkLogService"
import * as WeatherAlertService from "./WeatherAlertService"
import * as NoteReminderService from "./NoteReminderService"
import * as SoundService from "./SoundService"
import * as SampleDataService from "./SampleDataService"
import * as AlarmService from "./AlarmService"

// Named exports for individual imports
export {
  WeatherService,
  ShiftService,
  WorkLogService,
  WeatherAlertService,
  NoteReminderService,
  SoundService,
  SampleDataService,
  AlarmService,
}

// Default export for the directory
export default {
  WeatherService,
  ShiftService,
  WorkLogService,
  WeatherAlertService,
  NoteReminderService,
  SoundService,
  SampleDataService,
  AlarmService,
}
