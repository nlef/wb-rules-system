var config = readConfig("/usr/share/wb-rules-system/wbmz2-battery.conf")
if(config.enable){
defineVirtualDevice("wbmz2-battery", {
  title: "wbmz2-battery", // Название устройства /devices/relayClicker/meta/name
  cells: {
    current: { 
      type: "current",  
      value: 0    
    },
    voltage: { 
      type: "voltage",  
      value: 0    
    },
    charge: { 
      type: "value",  
      value: 0    
    },
    temperature: { 
      type: "temperature",  
      value: 0    
    },
  }
});
var i2cbus = config.bus;
var rcg_ohm = 0.025;

function parse2ndComplement(raw) {
  if (raw > 0x2000) {
    return raw - 0x4000;
  } else {
    return raw;
  }
}
  
function parse2ndComplement16(raw) {
  if (raw > 0x8000) {
    return raw - 0x10000;
  } else {
    return raw;
  }
}
  
function updateCurrent() {
  runShellCommand("i2cget -y {} 0x70 6 w".format(i2cbus), {
    captureOutput: true,
    exitCallback: function (exitCode, capturedOutput) {
      var raw = parseInt(capturedOutput);
      var voltage_uv = 11.77 * parse2ndComplement(raw);
      dev['wbmz2-battery']['current'] = Math.round(voltage_uv * 1E-6 / rcg_ohm * 1000) / 1000;
      
    }
  });
};

function updateVoltage() {
  runShellCommand("i2cget -y {} 0x70 8 w".format(i2cbus), {
    captureOutput: true,
    exitCallback: function (exitCode, capturedOutput) {
      var raw = parseInt(capturedOutput);
      var voltage_mv = 2.44 * raw;
      dev['wbmz2-battery']['voltage'] = Math.round(voltage_mv * 1E-3 * 1000) / 1000;
    }
  });
};

function updateTemperature() {  
  runShellCommand("i2cget -y {} 0x70 10 w".format(i2cbus), {
    captureOutput: true,
    exitCallback: function (exitCode, capturedOutput) {
      var raw = parseInt(capturedOutput);
      var temperature = 0.125 * parse2ndComplement(raw);
      dev['wbmz2-battery']['temperature'] = Math.round(temperature * 1000) / 1000;
    }
  });
};

function updateCharge() {
  runShellCommand("i2cget -y {} 0x70 2 w".format(i2cbus), {
    captureOutput: true,
    exitCallback: function (exitCode, capturedOutput) {
      var raw = parseInt(capturedOutput);
      var charge_uvh = 6.70 * parse2ndComplement16(raw);
      var charge_mah = charge_uvh * 1E-3 / rcg_ohm;
      dev['wbmz2-battery']['charge'] = Math.round(charge_mah * 10) / 10;
    }
  });
};
  

var counter = 0;
function update() {
    counter += 1;
    if (counter%4 == 0) {
	updateCurrent();
    } else if (counter % 4 == 1) {
	updateVoltage();
    }else if (counter % 4 == 2) {
	updateTemperature();
    }else if (counter % 4 == 3) {
	updateCharge();
    }	
};
setInterval(update, 1000);
}