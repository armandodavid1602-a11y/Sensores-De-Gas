// --- Configuración MQTT ---
const BROKER_HOST = '60eed51709a44eea9c3aa381a77f23d6.s1.eu.hivemq.cloud';
const BROKER_PORT = 8884;
const CLIENT_ID = 'ClienteWeb_Gas_' + Math.floor(Math.random() * 10000);
const USERNAME = 'Maxito';
const PASSWORD = 'Rasarm1602';
const KEEP_ALIVE_INTERVAL = 60;

// --- Tópicos ---
const TOPIC_MQ4 = 'gases/monitor/mq4';
const TOPIC_MQ2 = 'gases/monitor/mq2';
const TOPIC_MQ5 = 'gases/monitor/mq5';
const TOPIC_VENTILADOR = 'gases/control/ventilador';
const TOPIC_VENTANA = 'gases/control/ventana';
const TOPIC_ALARMA = 'gases/control/alarma';

// --- Elementos HTML ---
const statusDisplay = document.getElementById('status-display');

const mq4Value = document.getElementById('mq4-value');
const mq2Value = document.getElementById('mq2-value');
const mq5Value = document.getElementById('mq5-value');

const connectBtn = document.getElementById('connect-btn');
const disconnectBtn = document.getElementById('disconnect-btn');

const motorBtnOn = document.getElementById('motor-btn-on');
const motorBtnOff = document.getElementById('motor-btn-off');
const estadoVentilador = document.getElementById('ventilador-estado');

const ventanaAbrirBtn = document.getElementById('ventana-btn-abrir');
const ventanaCerrarBtn = document.getElementById('ventana-btn-cerrar');
const ventanaEstado = document.getElementById('ventana-estado');

const alarmaOnBtn = document.getElementById('alarma-btn-on');
const alarmaOffBtn = document.getElementById('alarma-btn-off');
const alarmaEstado = document.getElementById('alarma-estado');

let client = null;
let isConnected = false;

// --- UI ---
function updateStatus(status, isError = false) {
    statusDisplay.textContent = status;
    statusDisplay.className = 'p-3 text-center rounded-lg font-semibold transition-all';
    if (isConnected) {
        statusDisplay.classList.add('bg-green-800', 'text-green-300');
    } else if (isError) {
        statusDisplay.classList.add('bg-red-900', 'text-red-300');
    } else {
        statusDisplay.classList.add('bg-yellow-800', 'text-yellow-300');
    }
}

function updateDeviceState(element, state, colorClass) {
    element.textContent = `Estado: ${state}`;
    element.className = `text-center mt-3 ${colorClass} font-semibold`;
}

// --- MQTT Callbacks ---
function onMessageArrived(message) {
    const topic = message.destinationName;
    const payload = message.payloadString.trim();
    const value = parseFloat(payload);

    // Sensores
    if (!isNaN(value)) {
        if (topic === TOPIC_MQ2) mq2Value.textContent = value;
        if (topic === TOPIC_MQ4) mq4Value.textContent = value;
        if (topic === TOPIC_MQ5) mq5Value.textContent = value;
    }

    // Ventilador
    if (topic === TOPIC_VENTILADOR) {
        if (payload === 'ON') updateDeviceState(estadoVentilador, 'Encendido', 'text-green-400');
        else if (payload === 'OFF') updateDeviceState(estadoVentilador, 'Apagado', 'text-red-400');
    }

    // Ventana
    if (topic === TOPIC_VENTANA) {
        if (payload === 'ABRIR') updateDeviceState(ventanaEstado, 'Abierta', 'text-green-400');
        else if (payload === 'CERRAR') updateDeviceState(ventanaEstado, 'Cerrada', 'text-red-400');
    }

    // Alarma
    if (topic === TOPIC_ALARMA) {
        if (payload === 'ON') updateDeviceState(alarmaEstado, 'Activada', 'text-red-400');
        else if (payload === 'OFF') updateDeviceState(alarmaEstado, 'Desactivada', 'text-green-400');
    }
}

function onConnect() {
    isConnected = true;
    updateStatus("Conectado a MQTT ✅");

    client.subscribe(TOPIC_MQ2);
    client.subscribe(TOPIC_MQ4);
    client.subscribe(TOPIC_MQ5);
    client.subscribe(TOPIC_VENTILADOR);
    client.subscribe(TOPIC_VENTANA);
    client.subscribe(TOPIC_ALARMA);
}

// --- Conexión / Desconexión ---
function connectToMqtt() {
    client = new Paho.MQTT.Client(BROKER_HOST, BROKER_PORT, "/mqtt", CLIENT_ID);
    client.onMessageArrived = onMessageArrived;
    client.onConnectionLost = () => updateStatus("Conexión perdida ❌", true);

    const options = {
        useSSL: true,
        userName: USERNAME,
        password: PASSWORD,
        keepAliveInterval: KEEP_ALIVE_INTERVAL,
        timeout: 5,
        onSuccess: onConnect,
        onFailure: (e) => updateStatus("Error: " + e.errorMessage, true)
    };
    client.connect(options);
}

function disconnectFromMqtt() {
    if (client && client.isConnected()) {
        client.disconnect();
        isConnected = false;
        updateStatus("Desconectado ❌");
    }
}

// --- Botones ---
// Conexión
connectBtn.addEventListener('click', connectToMqtt);
disconnectBtn.addEventListener('click', disconnectFromMqtt);

// Ventilador
motorBtnOn.addEventListener('click', () => {
    if (client && client.isConnected()) {
        const msg = new Paho.MQTT.Message('ON');
        msg.destinationName = TOPIC_VENTILADOR;
        client.send(msg);
    }
});
motorBtnOff.addEventListener('click', () => {
    if (client && client.isConnected()) {
        const msg = new Paho.MQTT.Message('OFF');
        msg.destinationName = TOPIC_VENTILADOR;
        client.send(msg);
    }
});

// Ventanas
ventanaAbrirBtn.addEventListener('click', () => {
    if (client && client.isConnected()) {
        const msg = new Paho.MQTT.Message('ABRIR');
        msg.destinationName = TOPIC_VENTANA;
        client.send(msg);
    }
});
ventanaCerrarBtn.addEventListener('click', () => {
    if (client && client.isConnected()) {
        const msg = new Paho.MQTT.Message('CERRAR');
        msg.destinationName = TOPIC_VENTANA;
        client.send(msg);
    }
});

// Alarma
alarmaOnBtn.addEventListener('click', () => {
    if (client && client.isConnected()) {
        const msg = new Paho.MQTT.Message('ON');
        msg.destinationName = TOPIC_ALARMA;
        client.send(msg);
    }
});
alarmaOffBtn.addEventListener('click', () => {
    if (client && client.isConnected()) {
        const msg = new Paho.MQTT.Message('OFF');
        msg.destinationName = TOPIC_ALARMA;
        client.send(msg);
    }
});
