import SunCalc from "suncalc";

export function getSunTimes(lat: number, lng: number, date: Date = new Date()) {
  const times = SunCalc.getTimes(date, lat, lng);
  return { sunrise: times.sunrise, sunset: times.sunset };
}
