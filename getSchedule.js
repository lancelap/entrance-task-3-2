const mode = {
  day: {
    start: 7,
    end: 21
  },
  night: {
    start: 22,
    end: 6
  }
}


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

  const arr = sortedRates.map((element) => {
    let hoursArr = [];
    let hour = element.from;

    while (hour !== element.to + 1) {
      let hourMode = null;
      if (hour >= mode.day.start && hour <= mode.day.end) {
        hourMode = 'day';
      } else {
        hourMode = 'night';
      } 

      hoursArr.push({
        hour, 
        power: 2100, 
        hourMode
      });

      hour += 1;
      if (hour >= 24 && element.to < 23) { hour = 0 }
    }

    return {
      from: element.from, 
      to: element.to, 
      value: element.value,  
      hoursArr 
    }
  });

  // кол-во ожидающих приборов
  let pendingDevice = 6;
  // пока они есть работает цикл
  outer: while (pendingDevice !== 0) {

    for (let i = 0; i < sortedDevices.length; i++) {
      const device = sortedDevices[i];

      // if (device.mode === 'day') { continue }
      // console.log(device);
      sortedDevices.splice(i, 1);
    }
    pendingDevice--;
  }





  sortedDevices.forEach(device => {
    // console.log(device.duration);

    for (let i = device.duration; i >= 1; i--) {
      console.log(i);
      
    }
    console.log('@@', device.duration)
  });

  console.log(arr[1].hoursArr);

}

module.exports = getSchedule;

// if (hour >= mode.day.start && hour <= mode.day.end) {
//   const hourMode = 'day';
// }
// const hourMode = 'night';