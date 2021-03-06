const udp = require('dgram');

let ui = {
    timer: document.getElementById('timer'),
    robotState: document.getElementById('robot-state'),
    gyro: {
        container: document.getElementById('gyro'),
        val: 0,
        offset: 0,
        visualVal: 0,
        arm: document.getElementById('gyro-arm'),
        number: document.getElementById('gyro-number')
    },
    autoSelect: document.getElementById('auto-select'),
    posSelect: document.getElementById('pos-select'),
    pathSelect: document.getElementById('path-select'),
    robotDiagram: {
        arm: document.getElementById('flipper')
    },
    xCoord: document.getElementById('x-coord'),
    yCoord: document.getElementById('y-coord'),
    rightPos: document.getElementById('right-pos'),
    rightVel: document.getElementById('right-vel'),
    theme: {
        select: document.getElementById('theme-select'),
        link: document.getElementById('theme-link')
    },
    tuning: {
        list: document.getElementById('tuning'),
        button: document.getElementById('tuning-button'),
        key: document.getElementById('key'),
        value: document.getElementById('value'),
        set: document.getElementById('set'),
        get: document.getElementById('get')
    },
    lights: {
        led_select: document.getElementById('led-select'),
        red: document.getElementById('red-bar'),
        green: document.getElementById('green-bar'),
        blue: document.getElementById('blue-bar')
    }
};

NetworkTables.addRobotConnectionListener((connected) => {
    let state = connected ? 'Robot connected!' : 'Robot disconnected.';
    console.log(state);
    ui.robotState.innerHTML = state;
}, true);

NetworkTables.addGlobalListener((key, value, isNew) => {
    console.log("Key: " + key + " Value: " + value + " isNew: " + isNew);
    if (value === 'true') {
        value = true;
    } else if(value === 'false') {
        value = false;
    }

    let propName = key.substring(16);
    console.log(propName);
    let oldInput = document.getElementsByName(propName)[0]
    if (isNew === true && !oldInput) {
        if (key.substring(0, 16) === "/SmartDashboard/" || key.substring(0, 7) === "/drive/") {
            let div = document.createElement('div');
            ui.tuning.list.appendChild(div);
            let p = document.createElement('p');
            p.innerHTML = propName;
            div.appendChild(p);
            let input = document.createElement('input');
            input.name = propName;
            input.value = value;

            if (value === true || value === false) {
                input.type = 'checkbox';
                input.checked = value;
            } else if(!isNaN(value)) {
                input.type = 'number';
            } else {
                input.type = 'text';
            }

            input.onchange = () => {
                switch (input.type) {
                    case 'checkbox':
                        NetworkTables.setValue(key, input.checked);
                        break;
                    case 'number':
                        NetworkTables.setValue(key, parseInt(input.value));
                        break;
                    case 'text':
                        NetworkTables.setValue(key, input.value);
                        break;
                }
            };

            div.appendChild(input);
        } else {
            if (oldInput) {
                if (oldInput.type === 'checkbox') {
                    oldInput.checked = value;
                } else {
                    oldInput.value = value;
                }
            } else {
                console.log("Warning: non new variable " + key + " not present!");
            }
        }
    }
}, true);

let updateGyro = (key, value) => {
    ui.gyro.val = value;
    ui.gyro.visualVal = Math.floor(ui.gyro.val - ui.gyro.offset);
    ui.gyro.visualVal %= 360;
    if (ui.gyro.visualVal < 0) {
        ui.gyro.visualVal += 360;
    }

    ui.gyro.arm.style.transform = `rotate(${ui.gyro.visualVal}deg)`;
    ui.gyro.number.innerHTML = ui.gyro.visualVal;
};

NetworkTables.addKeyListener('/drive/heading', updateGyro);

NetworkTables.addKeyListener('/robot/time', (key, value) => {
    // This is an example of how a dashboard could display the remaining time in a match.
    // We assume here that value is an integer representing the number of seconds left.
    ui.timer.innerHTML = value < 0 ? '0:00' : Math.floor(value / 60) + ':' + (value % 60 < 10 ? '0' : '') + value % 60;
});

NetworkTables.addKeyListener('/drive/left_position', (key, value) => {
    ui.xCoord.innerHTML = value.toString();
});

NetworkTables.addKeyListener('/drive/left_velocity', (key, value) => {
    ui.yCoord.innerHTML = value.toString();
});

NetworkTables.addKeyListener('/drive/right_position', (key, value) => {
    ui.rightPos.innerHTML = value.toString();
});

NetworkTables.addKeyListener('/drive/right_velocity', (key, value) => {
    ui.rightVel.innerHTML = value.toString();
});

NetworkTables.addKeyListener('/platform/barUp', (key, value) => {
    var armAngle = 180;
    if (value === true) {
        armAngle = 90;
    }

    ui.robotDiagram.arm.style.transform = `rotate(${armAngle}deg)`;
});

// Load list of prewritten autonomous modes
NetworkTables.addKeyListener('/SmartDashboard/autonomous/options', (key, value) => {
    // Clear previous list
    while (ui.autoSelect.firstChild) {
        ui.autoSelect.removeChild(ui.autoSelect.firstChild);
    }
    // Make an option for each autonomous mode and put it in the selector
    for (let i = 0; i < value.length; i++) {
        var option = document.createElement('option');
        option.appendChild(document.createTextNode(value[i]));
        ui.autoSelect.appendChild(option);
    }
    // Set value to the already-selected mode. If there is none, nothing will happen.
    ui.autoSelect.value = NetworkTables.getValue('/SmartDashboard/current_mode');
});

NetworkTables.addKeyListener('/SmartDashboard/paths/options', (key, value) => {
    while (ui.pathSelect.firstChild) {
        ui.pathSelect.removeChild(ui.pathSelect.firstChild);
    }

    for (let i = 0; i < value.length; i++) {
        let option = document.createElement('option');
        option.appendChild(document.createTextNode(value[i]));
        ui.pathSelect.appendChild(option);
    }

    ui.pathSelect.value = NetworkTables.getValue('SmartDashboard/paths/selected');
});

// Load list of prewritten autonomous modes
NetworkTables.addKeyListener('/SmartDashboard/autonomous/selected', (key, value) => {
    ui.autoSelect.value = value;
});

NetworkTables.addKeyListener('/SmartDashboard/position/selected', (key, value) => {
    ui.posSelect.value = value;
});

NetworkTables.addKeyListener('/SmartDashboard/paths/selected', (key, value) => {
    ui.pathSelect.value = value;
});

// Listen for a theme change
NetworkTables.addKeyListener('/SmartDashboard/theme', (key, value) => {
    console.log("Changing theme to " + value);
    ui.theme.select.value = value;
    ui.theme.link.href = 'css/' + value + '.css';
});

// Reset gyro value to 0 on click
ui.gyro.container.onclick = function() {
    // Store previous gyro val, will now be subtracted from val for callibration
    ui.gyro.offset = ui.gyro.val;
    // Trigger the gyro to recalculate value.
    updateGyro('/drive/gyro', ui.gyro.val);
};
// Update NetworkTables when autonomous selector is changed
ui.autoSelect.onchange = function() {
    NetworkTables.setValue('SmartDashboard/autonomous/selected', ui.autoSelect.value);
};
// Update the robot when we choose the starting position
ui.posSelect.onchange = () => {
    NetworkTables.setValue('SmartDashboard/position/selected', ui.posSelect.value);
};

ui.pathSelect.onchange = () => {
    NetworkTables.setValue('SmartDashboard/paths/selected', ui.pathSelect.value);
};

// When the theme is changed, update it
ui.theme.select.onclick = () => {
    NetworkTables.setValue('SmartDashboard/theme', ui.theme.select.value);
};

ui.tuning.button.onclick = () => {
    if(ui.tuning.list.style.display === 'none') {
        ui.tuning.list.style.display = 'block';
    } else {
        ui.tuning.list.style.display = 'none';
    }
};

ui.tuning.get.onclick = () => {
    ui.tuning.value.value = NetworkTables.getValue(ui.tuning.key.value);
};

ui.tuning.set.onclick = () => {
    if (ui.tuning.key.value && ui.tuning.value.value) {
        NetworkTables.setValue('SmartDashboard/' + ui.tuning.key.value, ui.tuning.value.value);
    }
};

ui.lights.led_select.onchange = () => {
    if (ui.lights.led_select.value !== "Manual") {
        ui.lights.red.hidden = true;
        ui.lights.green.hidden = true;
        ui.lights.blue.hidden = true;
    } else {
        ui.lights.red.hidden = false;
        ui.lights.blue.hidden = false;
        ui.lights.green.hidden = false;
    }
    let anim = 0;
    if (ui.lights.led_select.value === "Manual") {
        anim = 1;
    } else if (ui.lights.led_select.value === "Rainbow") {
        anim = 2;
    } else if (ui.lights.led_select.value === "Rainbow Cycle") {
        anim = 3;
    }
    sendToPi("animation", anim);
};

function sendToPi(k, v) {
    let sock = udp.createSocket('udp4');
    let data = {
        key: k,
        value: v
    }

    sock.send(JSON.stringify(data), 42069, '10.21.86.208');
};

ui.lights.red.ondragend = () => {
    sendToPi("red", ui.lights.red.value)
};

ui.lights.green.ondragend = () => {
    sendToPi("green", ui.lights.green.value);
};

ui.lights.blue.ondragend = () => {
    sendToPi("blue", ui.lights.blue.value);
};