const mode = {
  day: {
    start: 7,
    end: 21
  },
  night: {
    start: 22,
    end: 6
  }
};

function getSchedule(data) {
  const sortedRates = data.rates.concat().sort((a, b) => {
    if (a.value < b.value) { return -1; }
    if (a.value > b.value) { return 1; }
  
    return 0;
  });
  const sortedDevices = data.devices.concat().sort((a, b) => {
    if (a.power > b.power) { return -1; }
    if (a.power < b.power) { return 1; }
  
    return 0;
  });
  const hours = convertRatesToHours(sortedRates);
  const output = {
    'schedule': {},
    'consumedEnergy': {
      'value': 0,
      'devices': {}
    }
  };

  for (let i = 0; i < sortedDevices.length; i++) { 
    const device = sortedDevices[i];
    // получаем массив часов работы одного прибора
    const deviceSchedule = getScheduleOfDevice(device, hours, sortedRates);
    
    for (let i = 0; i < deviceSchedule.length; i++) {
      const hour = deviceSchedule[i];
      const valueHour = hours.get(hour).value;
      let consumption = (device.power * valueHour) / 1000;

      hours.set(hour, {
        power: hours.get(hour).power - device.power, 
        mode: hours.get(hour).mode, 
        value: valueHour
      });

      if (output.schedule[hour] === undefined) {
        output.schedule[hour] = [device.id];
      } else {
        output.schedule[hour].push(device.id);
      }
      
      if (output.consumedEnergy.devices[device.id] === undefined) {
        output.consumedEnergy.devices[device.id] = consumption;
      } else {
        const energyDevice = output.consumedEnergy.devices[device.id];
        output.consumedEnergy.devices[device.id] = getSum(energyDevice, consumption, 4); 
      }
      
      const energyValue = output.consumedEnergy.value;
      output.consumedEnergy.value = getSum(energyValue, consumption, 4);
    }
  }

  return output;
}

function getScheduleOfDevice(device, hours, rates) {
  let duration = device.duration;
  let schedule = [];

  outer: for (let i = 0; i < rates.length; i++) {
    let from = rates[i].from;
    const to = rates[i].to;
    
    while (from !== to) {
      const start = checkHour(hours.get(from), from, device, device.duration);

      if (start) {
        let durationDevice = device.duration;
        let time = from + (device.duration - durationDevice);

        while (durationDevice > 0) {
          const isCheck = checkHour(hours.get(time), from, device, duration);
          if (!isCheck) {
            
            if (time > to || time < from) {
              continue outer;
            }

            time++;
            if (time >= 24) { time = 0; }

            durationDevice = device.duration;
            schedule = [];

            continue;
          } else {
            schedule.push(time);
          }

          durationDevice --;
          time ++;
        }

        break outer;
      }
      from += 1;
      if (from >= 24) { from = 0; }
    }
  }

  return schedule;
}

function checkHour(hour, from, device, duration) {
  if (hour.mode !== device.mode && device.mode !== undefined) {
    return false;
  }
  if (hour.power < device.power) {
    return false;
  }
  if (duration > 24 - from) {
    return false;
  }

  return true;
}

function convertRatesToHours(rates) {
  return rates.reduce((accumulator, currentRate) => {
    let from = currentRate.from;
    const to = currentRate.to;

    while (from !== to) {
      let hourMode = null;
      if (from >= mode.day.start && from <= mode.day.end) {
        hourMode = 'day';
      } else {
        hourMode = 'night';
      } 

      accumulator.set(from, { 
        power: 2100, 
        mode: hourMode,
        value: currentRate.value
      });

      from += 1;
      if (from >= 24 && to < 23) { from = 0; }
    }

    return accumulator;
  }, new Map());
}

function getSum(x, y, precision) {
  const pow = Math.pow(10, precision);
  return Math.round((x + y) * pow) / pow;
}


module.exports = getSchedule;