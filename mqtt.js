/* =======================
mqtt.js - Conexión HiveMQ para navegador
======================= */

// --- Configuración MQTT ---
const BROKER_HOST = "60eed51709a44eea9c3aa381a77f23d6.s1.eu.hivemq.cloud";
const BROKER_PORT = 8884; // WebSocket seguro TLS
const CLIENT_ID = "ClienteWeb_Gas_" + Math.floor(Math.random() * 10000);
const USERNAME = "Maxito";
const PASSWORD = "Rasarm1602";

// --- Tópicos ---
const TOPIC_MQ2 = "gases/monitor/mq2";
const TOPIC_MQ4 = "gases/monitor/mq4";
const TOPIC_MQ5 = "gases/monitor/mq5";
const TOPIC_VENTILADOR = "gases/control/ventilador";
const TOPIC_VENTANA = "gases/control/ventana";
const TOPIC_ALARMA = "gases/control/alarma";

// --- Elementos HTML ---
const statusDisplay = document.getElementById("status-display");
const mq2Value = document.getElementById("mq2-value");
const mq4Value = document.getElementById("mq4-value");
const mq5Value = document.getElementById("mq5-value");

const connectBtn = document.getElementById("connect-btn");
const disconnectBtn = document.getElementById("disconnect-btn");

const motorBtnOn = document.getElementById("motor-btn-on");
const motorBtnOff = document.getElementById("motor-btn-off");
const estadoVentilador = document.getElementById("ventilador-estado");

const ventanaAbrirBtn = document.getElementById("ventana-btn-abrir");
const ventanaCerrarBtn = document.getElementById("ventana-btn-cerrar");
const ventanaEstado = document.getElementById("ventana-estado");

const alarmaOnBtn = document.getElementById("alarma-btn-on");
const alarmaOffBtn = document.getElementById("alarma-btn-off");
const alarmaEstado = document.getElementById("alarma-estado");

// --- Variables ---
let client = null;
let isConnected = false;

// =======================
// Funciones de UI
// =======================
function updateStatus(message, isError = false) {
statusDisplay.textContent = message;
statusDisplay.className = "p-3 text-center rounded-lg font-semibold transition-all";
if (isConnected) {
statusDisplay.classList.add("bg-green-800", "text-green-300");
} else if (isError) {
statusDisplay.classList.add("bg-red-900", "text-red-300");
} else {
statusDisplay.classList.add("bg-yellow-800", "text-yellow-300");
}
}

function updateDeviceState(element, state, colorClass) {
element.textContent = `Estado: ${state}`;
element.className = `text-center mt-3 ${colorClass} font-semibold`;
}

// =======================
// Callbacks MQTT
// =======================
function onMessageArrived(message) {
const topic = message.destinationName;
const payload = message.payloadString.trim();

const value = parseFloat(payload);
if (!isNaN(value)) {
if (topic === TOPIC_MQ2) mq2Value.textContent = value;
if (topic === TOPIC_MQ4) mq4Value.textContent = value;
if (topic === TOPIC_MQ5) mq5Value.textContent = value;
}

if (topic === TOPIC_VENTILADOR) {
if (payload.includes("VENTILADOR=ON")) updateDeviceState(estadoVentilador, "Encendido", "text-green-400");
if (payload.includes("VENTILADOR=OFF")) updateDeviceState(estadoVentilador, "Apagado", "text-red-400");
}

if (topic === TOPIC_VENTANA) {
if (payload.includes("VENTANA=ABRIR")) updateDeviceState(ventanaEstado, "Abierta", "text-green-400");
if (payload.includes("VENTANA=CERRAR")) updateDeviceState(ventanaEstado, "Cerrada", "text-red-400");
}

if (topic === TOPIC_ALARMA) {
if (payload.includes("ALARM=ON")) updateDeviceState(alarmaEstado, "Activada", "text-red-400");
if (payload.includes("ALARM=OFF")) updateDeviceState(alarmaEstado, "Desactivada", "text-green-400");
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

connectBtn.disabled = true;
disconnectBtn.disabled = false;
}

function onConnectionLost(response) {
isConnected = false;
updateStatus("Conexión perdida ❌", true);
connectBtn.disabled = false;
disconnectBtn.disabled = true;
}

// =======================
// Conectar / Desconectar
// =======================
function connectToMqtt() {
try {
client = new Paho.MQTT.Client(BROKER_HOST, Number(BROKER_PORT), "/mqtt", CLIENT_ID);
client.onMessageArrived = onMessageArrived;
client.onConnectionLost = onConnectionLost;

```
client.connect({
  useSSL: true,
  userName: USERNAME,
  password: PASSWORD,
  keepAliveInterval: 60,
  timeout: 5,
  onSuccess: onConnect,
  onFailure: function (err) {
    console.error("Error MQTT:", err);
    updateStatus("Error MQTT: " + (err.errorMessage || "No se pudo conectar"), true);
  }
});

updateStatus("Conectando...");
```

} catch (e) {
console.error("Excepción MQTT:", e);
updateStatus("Error: " + e.message, true);
}
}

function disconnectFromMqtt() {
if (client && isConnected) {
client.disconnect();
isConnected = false;
updateStatus("Desconectado ❌");
connectBtn.disabled = false;
disconnectBtn.disabled = true;
}
}

// =======================
// Botones de UI
// =======================
connectBtn.addEventListener("click", connectToMqtt);
disconnectBtn.addEventListener("click", disconnectFromMqtt);

motorBtnOn.addEventListener("click", () => {
if (isConnected) {
const msg = new Paho.MQTT.Message("VENTILADOR=ON");
msg.destinationName = TOPIC_VENTILADOR;
client.send(msg);
}
});
motorBtnOff.addEventListener("click", () => {
if (isConnected) {
const msg = new Paho.MQTT.Message("VENTILADOR=OFF");
msg.destinationName = TOPIC_VENTILADOR;
client.send(msg);
}
});

ventanaAbrirBtn.addEventListener("click", () => {
if (isConnected) {
const msg = new Paho.MQTT.Message("VENTANA=ABRIR");
msg.destinationName = TOPIC_VENTANA;
client.send(msg);
}
});
ventanaCerrarBtn.addEventListener("click", () => {
if (isConnected) {
const msg = new Paho.MQTT.Message("VENTANA=CERRAR");
msg.destinationName = TOPIC_VENTANA;
client.send(msg);
}
});

alarmaOnBtn.addEventListener("click", () => {
if (isConnected) {
const msg = new Paho.MQTT.Message("ALARM=ON");
msg.destinationName = TOPIC_ALARMA;
client.send(msg);
}
});
alarmaOffBtn.addEventListener("click", () => {
if (isConnected) {
const msg = new Paho.MQTT.Message("ALARM=OFF");
msg.destinationName = TOPIC_ALARMA;
client.send(msg);
}
});
